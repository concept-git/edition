import { isRecord } from './session';

export type ResponseShape = {
  $ref?: string;
  type?: string | string[];
  required?: string[];
  properties?: Record<string, ResponseShape>;
  items?: ResponseShape;
  anyOf?: ResponseShape[];
  oneOf?: ResponseShape[];
};
type Schemas = Record<string, ResponseShape>;
function resolve(shape: ResponseShape, schemas: Schemas): ResponseShape {
  return shape.$ref
    ? (schemas[shape.$ref.split('/').at(-1) ?? ''] ?? {})
    : shape;
}
function nullable(shape: ResponseShape, schemas: Schemas): boolean {
  const schema = resolve(shape, schemas);
  if (
    schema.type === 'null' ||
    (Array.isArray(schema.type) && schema.type.includes('null'))
  )
    return true;
  const alternatives = schema.anyOf ?? schema.oneOf;
  return alternatives
    ? alternatives.some((item) => nullable(item, schemas))
    : !schema.type && !schema.properties && !schema.items;
}

/** Jackson uses null for unset optional fields. Omit only those fields, never required values or explicitly nullable facts. */
export function normalizeResponse(
  value: unknown,
  shape: ResponseShape,
  schemas: Schemas,
): unknown {
  const schema = resolve(shape, schemas);
  const alternatives = schema.anyOf ?? schema.oneOf;
  if (alternatives?.length)
    return normalizeResponse(value, alternatives[0], schemas);
  if (Array.isArray(value) && schema.items)
    return value.map((item) =>
      normalizeResponse(item, schema.items ?? {}, schemas),
    );
  if (!isRecord(value) || !schema.properties) return value;
  return normalizeObject(value, schema, schemas);
}
function normalizeObject(
  value: Record<string, unknown>,
  shape: ResponseShape,
  schemas: Schemas,
) {
  const output: Record<string, unknown> = { ...value };
  for (const [key, field] of Object.entries(shape.properties ?? {})) {
    if (!Object.hasOwn(value, key)) continue;
    if (
      value[key] === null &&
      !shape.required?.includes(key) &&
      !nullable(field, schemas)
    )
      delete output[key];
    else output[key] = normalizeResponse(value[key], field, schemas);
  }
  return output;
}
