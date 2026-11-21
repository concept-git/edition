// Generated from contracts/openapi.json. Do not edit.
type Validator = ((data: unknown) => boolean) & {
  errors?: readonly { instancePath?: string; message?: string }[] | null;
};
export const listTenantDomainsInput: Validator;
export const listTenantDomainsOutput: Validator;
export const listTenantDomainsOutputFull: Validator;
