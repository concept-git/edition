// Generated from contracts/openapi.json. Do not edit.
type Validator = ((data: unknown) => boolean) & {
  errors?: readonly { instancePath?: string; message?: string }[] | null;
};
export const provisionTenantInput: Validator;
export const provisionTenantOutput: Validator;
export const provisionTenantOutputFull: Validator;
