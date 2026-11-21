// Generated from contracts/openapi.json. Do not edit.
type Validator = ((data: unknown) => boolean) & {
  errors?: readonly { instancePath?: string; message?: string }[] | null;
};
export const setRetentionInput: Validator;
export const setRetentionOutput: Validator;
export const setRetentionOutputFull: Validator;
