import { readFile, writeFile, mkdir, rm, readdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import openapiTS, { astToString } from 'openapi-typescript';
import prettier from 'prettier';
import Ajv2020 from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';
import standaloneCode from 'ajv/dist/standalone/index.js';
import ts from 'typescript';

const root = new URL('../', import.meta.url);
const contract = JSON.parse(
  await readFile(new URL('../../contracts/openapi.json', root), 'utf8'),
);
const check = process.argv.includes('--check');
const formatting = await prettier.resolveConfig(
  fileURLToPath(new URL('.prettierrc.json', root)),
);
const banner = '// Generated from contracts/openapi.json. Do not edit.\n';
const emitted = new Set();
const entries = Object.entries(contract.paths).flatMap(([path, methods]) =>
  Object.entries(methods)
    .filter(([method]) =>
      ['get', 'post', 'put', 'patch', 'delete'].includes(method),
    )
    .map(([method, operation]) => ({ path, method, ...operation })),
);
await mkdir(new URL('src/shared/api/generated/', root), { recursive: true });

async function emit(name, text) {
  emitted.add(name);
  const file = new URL(`src/shared/api/generated/${name}`, root);
  const formatted = await prettier.format(banner + text, {
    ...formatting,
    parser: 'typescript',
  });
  if (check) {
    if ((await readFile(file, 'utf8').catch(() => '')) !== formatted)
      throw new Error(
        `Contract drift: ${fileURLToPath(file)}; run pnpm generate`,
      );
  } else await writeFile(file, formatted);
}
await emit(
  'types.ts',
  astToString(
    await openapiTS(contract, {
      transform(schema) {
        if (schema.format === 'binary')
          return ts.factory.createTypeReferenceNode('Blob');
      },
    }),
  ),
);

const apiFunctions = entries
  .map(({ operationId, method, path, responses, requestBody }) => {
    const success = Object.entries(responses ?? {}).find(
      ([status]) => Number(status) >= 200 && Number(status) < 300,
    )?.[1];
    const media = Object.keys(success?.content ?? {})[0];
    const parse = media?.startsWith('text/')
      ? `, parseAs: 'text'`
      : media && !media.includes('json') && media !== '*/*'
        ? `, parseAs: 'blob'`
        : '';
    const multipart =
      requestBody?.content?.['multipart/form-data'] &&
      Object.keys(requestBody.content).length === 1
        ? ', bodySerializer: multipartBody'
        : '';
    return `${JSON.stringify(operationId)}: (options: FetchOptions<operations[${JSON.stringify(operationId)}]>) => checked(${JSON.stringify(operationId)}, options, () => client.${method.toUpperCase()}(${JSON.stringify(path)}, {...options${parse}${multipart}})),`;
  })
  .join('\n');
await emit(
  'sdk.ts',
  `import createClient, { type FetchOptions } from 'openapi-fetch';
import createQueryClient from 'openapi-react-query';
import type { paths, operations } from './types';
import { checked } from '../validation';
import { multipartBody } from '../transfer';
export function createApi(fetcher: (request: Request) => Promise<Response>, baseUrl = globalThis.location?.origin ?? 'http://localhost') {
  const client = createClient<paths>({ baseUrl, fetch: fetcher });
  return { ...{${apiFunctions}}, query: createQueryClient(client) };
}
export type Api = ReturnType<typeof createApi>;`,
);

// Compile only contract schemas. No handwritten copy of the backend field rules.
const ajv = new Ajv2020({
  strict: false,
  allErrors: true,
  code: { source: true, esm: true },
  validateFormats: true,
});
addFormats(ajv);
for (const format of ['int32', 'int64', 'float', 'double', 'binary', 'byte'])
  ajv.addFormat(format, true);
ajv.addSchema({
  $id: 'https://edition.invalid/control',
  components: contract.components,
});
const groups = new Map();
const loaders = {};
const validatorType = `type Validator = ((data: unknown) => boolean) & { errors?: readonly { instancePath?: string; message?: string }[] | null };\n`;
function register(group, name, id) {
  if (!groups.has(group)) groups.set(group, {});
  groups.get(group)[name] = id;
  loaders[name] = group;
}
const metadata = {};
const responseShapes = {};
for (const operation of entries) {
  const {
    operationId,
    method,
    path,
    parameters = [],
    requestBody,
    responses = {},
  } = operation;
  const body =
    requestBody?.content?.['application/json']?.schema ??
    requestBody?.content?.['application/merge-patch+json']?.schema;
  const input = { type: 'object', properties: {}, required: [] };
  for (const location of ['path', 'query', 'header']) {
    const params = parameters.filter((parameter) => parameter.in === location);
    if (!params.length) continue;
    input.properties[location] = {
      type: 'object',
      properties: Object.fromEntries(
        params.map((parameter) => [parameter.name, parameter.schema]),
      ),
      required: params
        .filter((parameter) => parameter.required)
        .map((parameter) => parameter.name),
    };
    if (params.some((parameter) => parameter.required))
      input.required.push(location);
  }
  if (body) {
    input.properties.body = body;
    if (requestBody.required) input.required.push('body');
  }
  const response = Object.entries(responses).find(
    ([status, value]) =>
      Number(status) >= 200 &&
      Number(status) < 300 &&
      (value.content?.['application/json'] || value.content?.['*/*']),
  );
  const output =
    response?.[1].content?.['application/json']?.schema ??
    response?.[1].content?.['*/*']?.schema;
  if (output) responseShapes[operationId] = shape(output);
  for (const [suffix, schema] of [
    ['Input', input],
    ['Output', output],
    [
      'OutputFull',
      output?.anyOf?.find(
        (item) =>
          item.$ref && !item.$ref.split('/').at(-1).startsWith('Partial'),
      ) ?? output,
    ],
  ]) {
    if (!schema) continue;
    const name = operationId.replace(/[^\w]/g, '_') + suffix;
    const qualified = JSON.parse(
      JSON.stringify(schema).replaceAll(
        '#/components/',
        'https://edition.invalid/control#/components/',
      ),
    );
    const id = `https://edition.invalid/validators/${name}`;
    ajv.addSchema({ ...qualified, $id: id });
    register(operationId, name, id);
  }
  metadata[operationId] = {
    method,
    path,
    parameters,
    body: Boolean(body),
    binary: Boolean(response?.[1].content?.['*/*']),
  };
}
// Form/JSON boundaries need only request schemas; response schemas are compiled with their owner.
const formSchemas = new Set([
  'Source',
  ...entries.flatMap((operation) =>
    Object.values(operation.requestBody?.content ?? {}).flatMap((media) =>
      media.schema?.$ref ? [media.schema.$ref.split('/').at(-1)] : [],
    ),
  ),
]);
for (const name of formSchemas)
  register(
    `schema-${name}`,
    `schema_${name}`,
    `https://edition.invalid/control#/components/schemas/${name}`,
  );
for (const [group, validators] of groups) {
  let compiled = standaloneCode(ajv, validators).replaceAll(
    'require("ajv-formats/dist/formats").fullFormats',
    'fullFormats',
  );
  let imports = compiled.includes('fullFormats')
    ? `import { fullFormats } from 'ajv-formats/dist/formats.js';\n`
    : '';
  if (compiled.includes('require("ajv/dist/runtime/ucs2length").default')) {
    imports += `import ucs2Module from 'ajv/dist/runtime/ucs2length.js';\nconst ucs2Length = typeof ucs2Module === 'function' ? ucs2Module : ucs2Module.default;\n`;
    compiled = compiled.replaceAll(
      'require("ajv/dist/runtime/ucs2length").default',
      'ucs2Length',
    );
  }
  if (/require\(/.test(compiled))
    throw new Error(`Unsupported browser runtime dependency in ${group}`);
  await emit(`validate-${group}.js`, imports + compiled);
  await emit(
    `validate-${group}.d.ts`,
    validatorType +
      Object.keys(validators)
        .map((name) => `export const ${name}: Validator;`)
        .join('\n'),
  );
}
await emit(
  'validators.ts',
  `const loaders: Record<string, () => Promise<Record<string, unknown>>> = {${Object.entries(
    loaders,
  )
    .map(
      ([name, group]) =>
        `${JSON.stringify(name)}: () => import('./validate-${group}.js')`,
    )
    .join(
      ',\n',
    )}};\nexport async function loadValidator(name: string) { return (await loaders[name]?.())?.[name]; }`,
);
if (!check)
  await rm(new URL('src/shared/api/generated/validators.js', root), {
    force: true,
  });
for (const name of await readdir(new URL('src/shared/api/generated/', root))) {
  if (!name.startsWith('validate-') || emitted.has(name)) continue;
  if (check) throw new Error(`Obsolete generated contract file: ${name}`);
  await rm(new URL(`src/shared/api/generated/${name}`, root));
}
await emit(
  'operations.ts',
  `export const operations = ${JSON.stringify(metadata)} as const;`,
);
await emit(
  'response-shapes.ts',
  `import type { ResponseShape } from '../normalize';\nexport const schemas: Record<string, ResponseShape> = ${JSON.stringify(Object.fromEntries(Object.entries(contract.components.schemas).map(([name, schema]) => [name, shape(schema)])))};\nexport const responses: Record<string, ResponseShape> = ${JSON.stringify(responseShapes)};`,
);
console.log(
  `${check ? 'Checked' : 'Generated'} ${entries.length} operations from the backend contract.`,
);

function shape(schema) {
  if (!schema || typeof schema !== 'object') return {};
  return Object.fromEntries(
    Object.entries(schema)
      .filter(([key]) =>
        [
          '$ref',
          'type',
          'required',
          'properties',
          'items',
          'anyOf',
          'oneOf',
        ].includes(key),
      )
      .map(([key, value]) => [
        key,
        key === 'properties'
          ? Object.fromEntries(
              Object.entries(value).map(([name, item]) => [name, shape(item)]),
            )
          : key === 'items'
            ? shape(value)
            : ['anyOf', 'oneOf'].includes(key)
              ? value.map(shape)
              : value,
      ]),
  );
}
