import { ApiFailure } from './problem';
import { isRecord } from './session';
import type { components } from './generated/types';
import { normalizeResponse } from './normalize';

type ValidationFunction = ((data: unknown) => boolean) & {
  errors?: readonly { instancePath?: string; message?: string }[] | null;
};
export class ContractFailure extends Error {
  constructor(operation: string, direction: string) {
    super(`接口数据不符合后台契约：${operation} ${direction}`);
    this.name = 'ContractFailure';
  }
}

async function validate(
  id: string,
  direction: 'Input' | 'Output' | 'OutputFull',
  value: unknown,
) {
  const { loadValidator } = await import('./generated/validators');
  const validator = await loadValidator(id + direction);
  if (
    typeof validator === 'function' &&
    !(validator as ValidationFunction)(value)
  )
    throw new ContractFailure(id, direction);
}

export async function checked<
  T extends { data?: unknown; error?: unknown; response: Response },
>(
  id: string,
  options: unknown,
  request: () => Promise<T>,
): Promise<{ data: Exclude<T['data'], undefined>; response: Response }> {
  const input: Record<string, unknown> = isRecord(options)
    ? {
        ...(isRecord(options.params) ? options.params : {}),
        ...(options.body === undefined ? {} : { body: options.body }),
      }
    : {};
  await validate(id, 'Input', input);
  const result = await request();
  if (!result.response.ok) throw new ApiFailure(result.response, result.error);
  const { schemas, responses } = await import('./generated/response-shapes');
  const data = responses[id]
    ? normalizeResponse(result.data, responses[id], schemas)
    : result.data;
  const selectedFields =
    isRecord(input.query) && typeof input.query.fields === 'string';
  if (data !== undefined)
    await validate(id, selectedFields ? 'Output' : 'OutputFull', data);
  // openapi-fetch's discriminated union is narrowed by the HTTP status above.
  return {
    data: data as Exclude<T['data'], undefined>,
    response: result.response,
  };
}

export const newIntent = () => ({ 'Idempotency-Key': crypto.randomUUID() });

/** Unknown form/JSON input is narrowed only after the generated backend validator accepts it. */
export async function parseContract<K extends keyof components['schemas']>(
  schema: K,
  value: unknown,
): Promise<components['schemas'][K]> {
  const { loadValidator } = await import('./generated/validators');
  const validator = await loadValidator(`schema_${schema}`);
  if (
    typeof validator !== 'function' ||
    !(validator as ValidationFunction)(value)
  )
    throw new ContractFailure(schema, 'Input');
  return value as components['schemas'][K];
}
