// Generated from contracts/openapi.json. Do not edit.
type Validator = ((data: unknown) => boolean) & {
  errors?: readonly { instancePath?: string; message?: string }[] | null;
};
export const storageUsageInput: Validator;
export const storageUsageOutput: Validator;
export const storageUsageOutputFull: Validator;
