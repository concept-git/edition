"""Compile one OpenAPI contract plus compact command metadata; never infer authorization."""
import argparse
import csv
import hashlib
import io
import json
import re
from pathlib import Path

CLI = Path(__file__).resolve().parents[1]
ROOT = CLI.parents[1]
RESOURCE = CLI / 'src/main/resources/contract'
INVENTORY = ROOT / 'docs/design/control-cli-api-inventory.csv'


def read(path):
    return json.loads(path.read_text(encoding='utf-8'))


def compile_contract(api, commands, exclusions):
    routes = {}
    for path, methods in api['paths'].items():
        for method, wire in methods.items():
            if method not in {'get', 'post', 'put', 'patch', 'delete', 'head'}:
                continue
            identity = wire['operationId']
            if not re.fullmatch(r'[A-Za-z0-9_.-]+', identity) or '..' in identity:
                raise ValueError('Unsafe operationId')
            if identity in routes:
                raise ValueError('Duplicate operationId')
            routes[identity] = (path, method.upper(), wire)
    if set(routes) != set(commands) | set(exclusions) or set(commands) & set(exclusions):
        raise ValueError('Every API operation must have exactly one command or exclusion')
    names = [metadata['name'] for metadata in commands.values()]
    if len(names) != len(set(names)):
        raise ValueError('Duplicate command name')
    schemas = api['components']['schemas']
    if any(not re.fullmatch(r'[A-Za-z0-9_.-]+', name) or '..' in name for name in schemas):
        raise ValueError('Unsafe schema name')
    def resolve(schema):
        ref = schema.get('$ref')
        return schemas[ref.removeprefix('#/components/schemas/')] if ref else schema
    def secret_field(name, schema):
        return bool(re.search(r'(password|secret|token|putUrl|uploadUrl)$', name, re.I)) and resolve(schema).get('type') != 'object'
    def secret(schema, seen=None):
        seen = set() if seen is None else seen
        if '$ref' in schema:
            if schema['$ref'] in seen:
                return False
            return secret(resolve(schema), seen | {schema['$ref']})
        for name, field in schema.get('properties', {}).items():
            if secret_field(name, field) or secret(field, seen):
                return True
        return secret(schema.get('items', {}), seen) if schema.get('items') else any(secret(item, seen) for item in schema.get('anyOf', []))
    def sample(schema, depth=0):
        if depth > 32:
            raise ValueError('Example requires unbounded schema expansion')
        schema = resolve(schema)
        if schema.get('anyOf'):
            return sample(schema['anyOf'][0], depth + 1)
        if schema.get('enum'):
            return next(value for value in schema['enum'] if value is not None)
        kind = schema.get('type', 'string')
        kind = next((value for value in kind if value != 'null'), 'null') if isinstance(kind, list) else kind
        if kind == 'object':
            return {name: sample(schema['properties'][name], depth + 1) for name in schema.get('required', [])}
        if kind == 'array':
            count = schema.get('minItems', 0)
            choices = resolve(schema['items']).get('enum')
            if schema.get('uniqueItems') and choices is not None:
                choices = [value for value in choices if value is not None]
                if len(choices) < count:
                    raise ValueError('Example requires more unique enum values than the schema declares')
                return choices[:count]
            return [sample(schema['items'], depth + 1) for _ in range(count)]
        if kind in {'integer', 'number'}:
            return schema.get('minimum', 1)
        if kind == 'boolean':
            return False
        if kind == 'null':
            return None
        fmt, pattern = schema.get('format', ''), schema.get('pattern', '')
        value = {'uuid': '00000000-0000-0000-0000-000000000001', 'email': 'agent@example.test', 'date-time': '2027-01-01T00:00:00Z', 'uri': 'https://example.com/'}.get(fmt, 'VALUE')
        if 'user|team' in pattern: value = 'user:00000000-0000-4000-8000-000000000001'
        elif re.fullmatch(r'[a-z|]+', pattern) and '|' in pattern: value = pattern.split('|')[0]
        if len(value) < schema.get('minLength', 0): value = value * schema['minLength']
        return value
    result = []
    for identity, metadata in commands.items():
        if set(metadata) - {'name', 'description', 'confirm'} or not re.fullmatch(r'control(?:\.[a-z][A-Za-z0-9]*){2,}', metadata['name']):
            raise ValueError('Metadata may only define names, descriptions and confirmation')
        if not metadata['description'].strip() or not isinstance(metadata.get('confirm', False), bool):
            raise ValueError('Invalid command description or confirmation')
        path, method, wire = routes[identity]
        params = wire.get('parameters', [])
        if any('schema' not in parameter for parameter in params):
            raise ValueError(f'Missing parameter schema: {identity}')
        creds = wire.get('x-credential-types')
        if not isinstance(creds, list) or not creds or not set(creds) <= {'anonymous', 'session', 'management_token', 'space_token'} or not isinstance(wire.get('x-read-only'), bool):
            raise ValueError(f'Missing authoritative credential/effect declaration: {identity}')
        body = wire.get('requestBody', {})
        content = body.get('content', {})
        scope = wire.get('x-management-scope', '')
        mutates = not wire['x-read-only']
        keyed = any(p['name'] == 'Idempotency-Key' for p in params)
        response_types = {mime for status, response in wire['responses'].items() if status.startswith('2') for mime in response.get('content', {})}
        capabilities = dict(jsonInput='application/json' in content,
            binaryInput=bool(set(content) & {'application/zip', 'application/octet-stream', 'multipart/form-data'}),
            binaryOutput=bool(response_types - {'application/json', 'application/problem+json', '*/*'}),
            pagination=any(p['name'] == 'cursor' for p in params),
            confirmation=metadata.get('confirm', False), invocation=mutates and 'anonymous' not in creds,
            secretInput=any(secret_field(p['name'], p['schema']) for p in params) or secret(content.get('application/json', {}).get('schema', {})),
            secretOutput=any(secret(c.get('schema', {})) for status, response in wire['responses'].items() if status.startswith('2') for c in response.get('content', {}).values()))
        example = {'params': {p['name']: ('\"ETAG_FROM_GET\"' if p['name'] == 'If-Match' else sample(p['schema'])) for p in params if p.get('required') and p['name'] != 'Idempotency-Key'}, 'privateParams': any(secret_field(p['name'], p['schema']) for p in params)}
        # HTTP omission is legacy-compatible; new CLI/MCP/batch callers must preserve explicit content intent.
        cli_required = ['intent'] if identity == 'editPage' else []
        if capabilities['jsonInput']:
            body_schema = content['application/json']['schema']
            example.update(json=sample(body_schema), privateBody=secret(body_schema))
            for field in cli_required:
                if field not in resolve(body_schema).get('properties', {}):
                    raise ValueError(f'Missing required CLI intent contract: {identity}.{field}')
                example['json'][field] = sample(resolve(body_schema)['properties'][field])
        result.append(dict(example=example, operationId=identity, apiCommand=metadata['name'], description=metadata['description'], method=method, path=path,
            parameters=params, requestBody=body, responses=wire['responses'], capabilities=capabilities,
            credentialTypes=creds, requiredScopes=[] if scope in {'', 'session-only'} else [scope],
            mutates=mutates, highImpact=metadata.get('confirm', False),
            idempotencyMode='server-key' if keyed else 'read-only' if not mutates else 'explicit-single-attempt'))
        if cli_required:
            result[-1]['cliRequiredBodyFields'] = cli_required
    # Validate every local schema reference, including unselected operations and cyclic types.
    def refs(value):
        if isinstance(value, dict):
            if '$ref' in value and (not value['$ref'].startswith('#/components/schemas/') or value['$ref'].split('/')[-1] not in schemas):
                raise ValueError('Unknown or external schema reference')
            for child in value.values(): refs(child)
        elif isinstance(value, list):
            for child in value: refs(child)
    refs(result); refs(schemas)
    return result


def compile_groups(commands, groups):
    expected = {'.'.join(parts[:end]) for metadata in commands.values()
                for parts in [metadata['name'].split('.')]
                for end in range(2, len(parts))}
    if set(groups) != expected or any(not isinstance(text, str) or not text.strip()
                                      or any(ord(char) < 32 for char in text) for text in groups.values()):
        raise ValueError('Every API command group needs exactly one nonempty task description')
    return dict(sorted(groups.items()))


def exact_choice_patterns(value):
    """Expose finite Jakarta Pattern choices as exact CLI enums, without changing general regexes."""
    if isinstance(value, list):
        return [exact_choice_patterns(item) for item in value]
    if not isinstance(value, dict):
        return value
    result = {key: exact_choice_patterns(item) for key, item in value.items()}
    pattern = result.get('pattern', '')
    kind = result.get('type')
    if (kind == 'string' or isinstance(kind, list) and 'string' in kind and set(kind) <= {'string', 'null'}) and re.fullmatch(r'[A-Za-z0-9_-]+(?:\|[A-Za-z0-9_-]+)+', pattern):
        choices = list(dict.fromkeys(pattern.split('|')))
        if isinstance(kind, list) and 'null' in kind:
            choices.append(None)
        result['enum'] = [item for item in result.get('enum', choices) if item in choices]
    return result


def generate():
    raw = (ROOT / 'contracts/openapi.json').read_bytes()
    api = json.loads(raw)
    operations = compile_contract(api, read(CLI / 'metadata/commands.json'), read(CLI / 'metadata/excluded.json'))
    index = dict(version='1', apiVersion=api['info']['version'], contractSha256=hashlib.sha256(raw).hexdigest(), commands={}, operationIds={})
    index['groups'] = compile_groups(read(CLI / 'metadata/commands.json'), read(CLI / 'metadata/groups.json'))
    files = {}
    for operation in operations:
        name, identity = operation['apiCommand'], operation['operationId']
        ref = 'operations/' + identity + '.json'
        index['commands'][name] = dict(ref=ref, description=operation['description'], operationId=identity)
        index['operationIds'][identity] = name
        files[ref] = operation
    files['index.json'] = index
    for name, schema in api['components']['schemas'].items():
        files['schemas/' + name + '.json'] = schema
    return {name: json.dumps(exact_choice_patterns(value), ensure_ascii=False, indent=2) + '\n' for name, value in files.items()}

def inventory(files):
    """Keep the human API map current without duplicating request/response schemas."""
    methods = {op['operationId']: op for name, text in files.items()
               if name.startswith('operations/') for op in [json.loads(text)]}
    excluded = read(CLI / 'metadata/excluded.json')
    output = io.StringIO(newline='')
    writer = csv.writer(output, lineterminator='\n')
    writer.writerow(['operation_id', 'method', 'path', 'command', 'credential_types',
                     'required_scopes', 'idempotency', 'confirmation', 'description', 'exclusion'])
    for path, routes in read(ROOT / 'contracts/openapi.json')['paths'].items():
        for method, wire in routes.items():
            if not isinstance(wire, dict) or 'operationId' not in wire: continue
            identity = wire['operationId']; op = methods.get(identity, {})
            writer.writerow([identity, method.upper(), path,
                             'spacectl ' + op['apiCommand'].replace('.', ' ') if op else '',
                             '|'.join(op.get('credentialTypes', wire.get('x-credential-types', []))),
                             '|'.join(op.get('requiredScopes', [])), op.get('idempotencyMode', ''),
                             str(op['highImpact']).lower() if op else '', op.get('description', ''),
                             excluded.get(identity, '')])
    return output.getvalue()


def main(argv=None):
    """Generate or verify artifacts using the same path as the command-line entry point."""
    parser = argparse.ArgumentParser(); parser.add_argument('--check', action='store_true'); args = parser.parse_args(argv)
    expected = generate()
    api_map = inventory(expected)
    # 目录索引使用契约内的 /，避免 Windows 的反斜杠被误判为文件漂移。
    current = {p.relative_to(RESOURCE).as_posix() for p in RESOURCE.rglob('*.json')} if RESOURCE.exists() else set()
    if args.check:
        if current != set(expected) or any((RESOURCE/name).read_text(encoding='utf-8') != value for name, value in expected.items()) or not INVENTORY.exists() or INVENTORY.read_text(encoding='utf-8') != api_map:
            raise SystemExit('Contract drift: run python3 scripts/generate_contract.py')
    else:
        INVENTORY.write_text(api_map, encoding='utf-8', newline='\n')
        for name in current - set(expected): (RESOURCE/name).unlink()
        for name, value in expected.items():
            path = RESOURCE/name; path.parent.mkdir(parents=True, exist_ok=True); path.write_text(value, encoding='utf-8', newline='\n')


if __name__ == '__main__':
    main()
