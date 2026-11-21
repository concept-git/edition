// Generated from contracts/openapi.json. Do not edit.
type Validator = ((data: unknown) => boolean) & {
  errors?: readonly { instancePath?: string; message?: string }[] | null;
};
export const listTenantsInput: Validator;
export const listTenantsOutput: Validator;
export const listTenantsOutputFull: Validator;
