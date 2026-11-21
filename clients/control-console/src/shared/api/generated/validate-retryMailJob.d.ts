// Generated from contracts/openapi.json. Do not edit.
type Validator = ((data: unknown) => boolean) & {
  errors?: readonly { instancePath?: string; message?: string }[] | null;
};
export const retryMailJobInput: Validator;
export const retryMailJobOutput: Validator;
export const retryMailJobOutputFull: Validator;
