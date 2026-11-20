import {
  registerSchema,
  unregisterSchema,
  validate,
  type Output,
  type SchemaFragment,
  type SchemaObject,
  type Validator,
} from "@hyperjump/json-schema/draft-2020-12";
import type {
  ContentConfig,
  ContentDiagnostic,
  ContentTypeDefinition,
  JsonValue,
} from "./types.ts";
import {
  removeUriSchemePlugin,
  step,
  value as browserValue,
  type Browser,
} from "@hyperjump/browser";
import { getSchema } from "@hyperjump/json-schema/experimental";

// Stored schemas are self-contained snapshots. Even malformed references cannot trigger I/O.
for (const scheme of ["http", "https", "file"]) removeUriSchemePlugin(scheme);

export const JSON_SCHEMA_DIALECT =
  "https://json-schema.org/draft/2020-12/schema";
let resourceSequence = 0;

const singleSchemas = [
  "additionalProperties",
  "unevaluatedProperties",
  "propertyNames",
  "items",
  "contains",
  "unevaluatedItems",
  "not",
  "if",
  "then",
  "else",
  "contentSchema",
];
const schemaLists = ["allOf", "anyOf", "oneOf", "prefixItems"];
const schemaMaps = [
  "$defs",
  "definitions",
  "properties",
  "patternProperties",
  "dependentSchemas",
];
const coreKeywords = new Set([
  "$schema",
  "$id",
  "$anchor",
  "$dynamicAnchor",
  "$ref",
  "$dynamicRef",
  "$vocabulary",
]);
type LiteralPatch = { path: string[]; keyword: string; value: SchemaFragment };

/** Hyperjump 1.18 processes identifiers inside literal JSON. Shield registration only; the
 * original values are restored through its public browser API before validation compiles. */
function maskLiterals(
  schema: SchemaObject | boolean,
  path: string[],
  patches: LiteralPatch[],
  referenced: string[][] = [],
): SchemaObject | boolean {
  if (typeof schema === "boolean") return schema;
  return Object.fromEntries(
    Object.entries(schema).map(([key, child]) => {
      const at = [...path, key];
      if (singleSchemas.includes(key))
        return [
          key,
          maskLiterals(
            child as SchemaObject | boolean,
            at,
            patches,
            referenced,
          ),
        ];
      if (schemaLists.includes(key))
        return [
          key,
          (child as (SchemaObject | boolean)[]).map((node, index) =>
            maskLiterals(node, [...at, String(index)], patches, referenced),
          ),
        ];
      if (schemaMaps.includes(key))
        return [
          key,
          Object.fromEntries(
            Object.entries(child as Record<string, SchemaObject | boolean>).map(
              ([name, node]) => [
                name,
                maskLiterals(node, [...at, name], patches, referenced),
              ],
            ),
          ),
        ];
      if (
        !coreKeywords.has(key) &&
        child !== null &&
        typeof child === "object"
      ) {
        const preserve = (
          value: SchemaFragment,
          location: string[],
        ): SchemaFragment => {
          if (
            referenced.some(
              (target) =>
                target.length === location.length &&
                target.every((part, index) => location[index] === part),
            )
          )
            return maskLiterals(
              value as SchemaObject | boolean,
              location,
              patches,
              referenced,
            );
          return Array.isArray(value)
            ? value.map((child, index) =>
                field(child, [...location, String(index)]),
              )
            : Object.fromEntries(
                Object.entries(value as Record<string, SchemaFragment>).map(
                  ([key, child]) => [key, field(child, [...location, key])],
                ),
              );
        };
        const field = (
          value: SchemaFragment,
          location: string[],
        ): SchemaFragment => {
          if (value === null || typeof value !== "object") return value;
          if (
            referenced.some((target) =>
              location.every((part, index) => target[index] === part),
            )
          )
            return preserve(value, location);
          patches.push({
            path: location.slice(0, -1),
            keyword: location.at(-1)!,
            value,
          });
          return null;
        };
        return [key, field(child, at)];
      }
      return [key, child];
    }),
  );
}

/** Walk schema locations only: references inside const/default/examples are instance data. */
function checkSchemaDocumentConstraints(
  value: unknown,
  path = "",
): ContentDiagnostic[] {
  if (!value || typeof value !== "object" || Array.isArray(value)) return [];
  const schema = value as Record<string, unknown>;
  const errors: ContentDiagnostic[] = [];
  for (const key of ["$ref", "$dynamicRef"]) {
    const reference = schema[key];
    if (typeof reference === "string" && !reference.startsWith("#"))
      errors.push({
        severity: "error",
        code: "external_ref",
        message: "只支持文档内的 # 引用。",
        path: `${path}/${key}`,
      });
  }
  if (schema.$schema !== undefined && schema.$schema !== JSON_SCHEMA_DIALECT)
    errors.push({
      severity: "error",
      code: "schema_dialect",
      message: "只支持 JSON Schema Draft 2020-12。",
      path: `${path}/$schema`,
    });
  for (const key of singleSchemas)
    errors.push(
      ...checkSchemaDocumentConstraints(schema[key], `${path}/${key}`),
    );
  for (const key of schemaLists) {
    const list = schema[key];
    if (Array.isArray(list))
      list.forEach((child, index) =>
        errors.push(
          ...checkSchemaDocumentConstraints(child, `${path}/${key}/${index}`),
        ),
      );
  }
  for (const key of schemaMaps) {
    const map = schema[key];
    if (map && typeof map === "object" && !Array.isArray(map))
      for (const [name, child] of Object.entries(map))
        errors.push(
          ...checkSchemaDocumentConstraints(
            child,
            `${path}/${key}/${name.replaceAll("~", "~0").replaceAll("/", "~1")}`,
          ),
        );
  }
  return errors;
}

function diagnostics(output: Output, code: string): ContentDiagnostic[] {
  if (output.valid) return [];
  const errors = output.errors ?? [];
  return errors.length
    ? errors.slice(0, 30).map((error) => ({
        severity: "error" as const,
        code,
        message: `不符合 ${error.keyword.split("/").at(-1) ?? "Schema"} 约束。`,
        path: error.instanceLocation,
      }))
    : [{ severity: "error", code, message: "不符合 JSON Schema 约束。" }];
}

async function prepareSchemaValidator(
  schema: unknown,
): Promise<{ errors: ContentDiagnostic[]; validator?: Validator }> {
  if (
    typeof schema !== "boolean" &&
    (!schema || typeof schema !== "object" || Array.isArray(schema))
  )
    return {
      errors: [
        {
          severity: "error",
          code: "schema_invalid",
          message: "JSON Schema 必须是对象或布尔值。",
        },
      ],
    };
  const errors = checkSchemaDocumentConstraints(schema);
  if (errors.length) return { errors };
  // Hyperjump interprets an AST; it does not generate JavaScript or need CSP unsafe-eval.
  const meta = await validate(
    JSON_SCHEMA_DIALECT,
    schema as JsonValue,
    "BASIC",
  );
  if (!meta.valid) return { errors: diagnostics(meta, "schema_invalid") };
  // getRandomValues is available on HTTP; randomUUID requires a secure context.
  const random = crypto.getRandomValues(new Uint32Array(2));
  const uri = `https://space.invalid/content-schema/${random[0].toString(36)}-${random[1].toString(36)}-${++resourceSequence}`;
  // Fragment-only references retain their embedded resource and dynamic scope. A private
  // root ID keeps independent documents out of each other's registration namespace.
  const isolated =
    typeof schema === "boolean"
      ? schema
      : ({ ...schema, $id: uri } as SchemaObject);
  const patches: LiteralPatch[] = [];
  try {
    registerSchema(
      maskLiterals(isolated, [], patches),
      uri,
      JSON_SCHEMA_DIALECT,
    );
    const root = await getSchema(uri);
    for (const patch of patches) {
      let node: Browser = root;
      for (const segment of patch.path) node = await step(segment, node);
      Object.defineProperty(
        browserValue<Record<string, unknown>>(node),
        patch.keyword,
        {
          value: patch.value,
          enumerable: true,
          configurable: true,
          writable: true,
        },
      );
    }
    return { errors: [], validator: await validate(uri) };
  } finally {
    unregisterSchema(uri);
  }
}

export async function validateSchemaDocument(
  schema: unknown,
): Promise<ContentDiagnostic[]> {
  try {
    return (await prepareSchemaValidator(schema)).errors;
  } catch (error) {
    return [
      {
        severity: "error",
        code: "schema_invalid",
        message: error instanceof Error ? error.message : String(error),
      },
    ];
  }
}

export async function validateJsonValue(
  value: unknown,
  source?: string,
): Promise<ContentDiagnostic[]> {
  if (source === undefined) return [];
  try {
    const prepared = await prepareSchemaValidator(JSON.parse(source));
    return prepared.validator
      ? diagnostics(
          prepared.validator(value as JsonValue, "BASIC"),
          "instance_invalid",
        )
      : prepared.errors;
  } catch (error) {
    return [
      {
        severity: "error",
        code: "schema_invalid",
        message: error instanceof Error ? error.message : String(error),
      },
    ];
  }
}

/** Generic envelope validation uses only the immutable, locally supplied resource closure. */
async function validateResourceEnvelope(
  resources: Record<string, string>,
  schemaRef: string,
  instance: JsonValue,
): Promise<ContentDiagnostic[]> {
  const namespace = `https://space.invalid/type-validation/${crypto.getRandomValues(new Uint32Array(1))[0]}-${++resourceSequence}/`;
  const locations = new Map<string, string>();
  const documents = new Map<string, SchemaObject | boolean>();
  const absolute = (reference: string, base: string) =>
    new URL(reference, base).href;
  for (const [uri, source] of Object.entries(resources)) {
    const schema = JSON.parse(source) as SchemaObject | boolean;
    const identity =
      typeof schema === "object" && typeof schema.$id === "string"
        ? absolute(schema.$id, uri)
        : uri;
    if (!locations.has(identity))
      locations.set(identity, `${namespace}${locations.size}`);
    locations.set(uri, locations.get(identity)!);
    if (!documents.has(identity)) documents.set(identity, schema);
  }
  const roots = new Map<string, { document: string; path: string[] }>();
  for (const [uri] of documents) roots.set(uri, { document: uri, path: [] });
  for (const [alias, target] of locations) {
    const canonical = [...documents.keys()].find(
      (uri) => locations.get(uri) === target,
    )!;
    roots.set(alias, { document: canonical, path: [] });
  }
  const referenced = new Map<string, string[][]>();
  const queue: string[] = [];
  const seenReferences = new Set<string>();
  function walk(
    schema: SchemaObject | boolean,
    base: string,
    rewrite: boolean,
    path: string[],
    document: string,
  ): SchemaObject | boolean {
    if (typeof schema === "boolean") return schema;
    const identity =
      typeof schema.$id === "string" ? absolute(schema.$id, base) : base;
    if (!locations.has(identity))
      locations.set(identity, `${namespace}${locations.size}`);
    if (typeof schema.$id === "string") roots.set(identity, { document, path });
    const next = { ...schema };
    if (rewrite && typeof schema.$id === "string")
      next.$id = locations.get(identity)!;
    for (const key of ["$ref", "$dynamicRef"]) {
      const reference = schema[key];
      if (typeof reference !== "string") continue;
      const resolved = new URL(reference, identity);
      if (!rewrite) {
        if (!seenReferences.has(resolved.href)) {
          seenReferences.add(resolved.href);
          queue.push(resolved.href);
        }
        continue;
      }
      if (reference.startsWith("#")) continue;
      const fragment = resolved.hash;
      resolved.hash = "";
      const local = locations.get(resolved.href);
      if (!local)
        throw new Error(`Schema 资源未包含在此定义版本中：${resolved.href}`);
      next[key] = local + fragment;
    }
    for (const key of singleSchemas)
      if (schema[key] !== undefined)
        next[key] = walk(
          schema[key] as SchemaObject | boolean,
          identity,
          rewrite,
          [...path, key],
          document,
        );
    for (const key of schemaLists)
      if (Array.isArray(schema[key]))
        next[key] = (schema[key] as (SchemaObject | boolean)[]).map(
          (child, index) =>
            walk(
              child,
              identity,
              rewrite,
              [...path, key, String(index)],
              document,
            ),
        );
    for (const key of schemaMaps)
      if (
        schema[key] &&
        typeof schema[key] === "object" &&
        !Array.isArray(schema[key])
      )
        next[key] = Object.fromEntries(
          Object.entries(
            schema[key] as Record<string, SchemaObject | boolean>,
          ).map(([name, child]) => [
            name,
            walk(child, identity, rewrite, [...path, key, name], document),
          ]),
        );
    // A JSON Pointer may explicitly identify a Schema outside standard vocabulary positions.
    const descend = (
      value: SchemaFragment,
      location: string[],
    ): SchemaFragment => {
      const targets = referenced.get(document) ?? [];
      if (
        targets.some(
          (target) =>
            target.length === location.length &&
            target.every((part, index) => location[index] === part),
        )
      )
        return walk(
          value as SchemaObject | boolean,
          identity,
          rewrite,
          location,
          document,
        );
      if (
        !value ||
        typeof value !== "object" ||
        !targets.some((target) =>
          location.every((part, index) => target[index] === part),
        )
      )
        return value;
      return Array.isArray(value)
        ? value.map((child, index) =>
            descend(child, [...location, String(index)]),
          )
        : Object.fromEntries(
            Object.entries(value).map(([key, child]) => [
              key,
              descend(child, [...location, key]),
            ]),
          );
    };
    if (rewrite)
      for (const key of Object.keys(schema))
        if (
          !singleSchemas.includes(key) &&
          !schemaLists.includes(key) &&
          !schemaMaps.includes(key)
        )
          next[key] = descend(next[key], [...path, key]);
    return next;
  }
  for (const [uri, schema] of documents) walk(schema, uri, false, [], uri);
  for (let index = 0; index < queue.length; index++) {
    const reference = new URL(queue[index]);
    const fragment = decodeURIComponent(reference.hash.slice(1));
    reference.hash = "";
    if (!fragment.startsWith("/")) continue;
    const root = roots.get(reference.href);
    if (!root)
      throw new Error(`Schema 资源未包含在此定义版本中：${reference.href}`);
    const path = [
      ...root.path,
      ...fragment
        .slice(1)
        .split("/")
        .map((part) => part.replaceAll("~1", "/").replaceAll("~0", "~")),
    ];
    const targets = referenced.get(root.document) ?? [];
    targets.push(path);
    referenced.set(root.document, targets);
    let node: unknown = documents.get(root.document);
    for (const part of path)
      node =
        node && typeof node === "object"
          ? (node as Record<string, unknown>)[part]
          : undefined;
    if (
      typeof node !== "boolean" &&
      (!node || typeof node !== "object" || Array.isArray(node))
    )
      throw new Error(`Schema 引用未指向对象或布尔值：${queue[index]}`);
    walk(
      node as SchemaObject | boolean,
      reference.href,
      false,
      path,
      root.document,
    );
  }

  const registered: string[] = [];
  const pending: { uri: string; patches: LiteralPatch[] }[] = [];
  try {
    for (const [uri, schema] of documents) {
      const target = locations.get(uri)!;
      const rewritten = walk(schema, uri, true, [], uri);
      const isolated =
        typeof rewritten === "boolean"
          ? rewritten
          : { ...rewritten, $id: target };
      const patches: LiteralPatch[] = [];
      registerSchema(
        maskLiterals(isolated, [], patches, referenced.get(uri)),
        target,
        JSON_SCHEMA_DIALECT,
      );
      registered.push(target);
      pending.push({ uri: target, patches });
    }
    for (const { uri, patches } of pending) {
      const root = await getSchema(uri);
      for (const patch of patches) {
        let node: Browser = root;
        for (const segment of patch.path) node = await step(segment, node);
        Object.defineProperty(
          browserValue<Record<string, unknown>>(node),
          patch.keyword,
          {
            value: patch.value,
            enumerable: true,
            configurable: true,
            writable: true,
          },
        );
      }
    }
    const reference = new URL(schemaRef);
    const fragment = reference.hash;
    reference.hash = "";
    const target = locations.get(reference.href);
    if (!target) throw new Error("此版本缺少声明的 Schema 资源。");
    return diagnostics(
      (await validate(target + fragment))(instance, "BASIC"),
      "content_schema_invalid",
    );
  } finally {
    for (const uri of registered.reverse()) unregisterSchema(uri);
  }
}

export async function validateTypeContent(
  definition: ContentTypeDefinition,
  source: string,
  interpretation: ContentConfig,
): Promise<ContentDiagnostic[]> {
  const validation = definition.validation;
  if (!validation) return [];
  try {
    let dynamic: JsonValue | undefined;
    if (validation.instanceSchemaPointer) {
      let value: unknown = { content: source, interpretation };
      for (const token of validation.instanceSchemaPointer.slice(1).split("/"))
        value =
          value && typeof value === "object"
            ? (value as Record<string, unknown>)[
                token.replaceAll("~1", "/").replaceAll("~0", "~")
              ]
            : undefined;
      dynamic = value as JsonValue | undefined;
    }
    if (!validation.schemaRef && (dynamic === undefined || dynamic === null))
      return [];
    const content: JsonValue =
      validation.encoding === "json" ? JSON.parse(source) : source;
    const errors = validation.schemaRef
      ? await validateResourceEnvelope(
          definition.schemaResources,
          validation.schemaRef,
          {
            content,
            interpretation,
          },
        )
      : [];
    if (dynamic !== undefined && dynamic !== null)
      errors.push(
        ...(await validateJsonValue(
          content,
          typeof dynamic === "string" ? dynamic : JSON.stringify(dynamic),
        )),
      );
    return errors;
  } catch (error) {
    return [
      {
        severity: "error",
        code: "content_schema_invalid",
        message: error instanceof Error ? error.message : String(error),
      },
    ];
  }
}
