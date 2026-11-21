// Generated from contracts/openapi.json. Do not edit.
type Validator = ((data: unknown) => boolean) & {
  errors?: readonly { instancePath?: string; message?: string }[] | null;
};
export const tenantUsageInput: Validator;
export const tenantUsageOutput: Validator;
export const tenantUsageOutputFull: Validator;
