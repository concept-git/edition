// Generated from contracts/openapi.json. Do not edit.
type Validator = ((data: unknown) => boolean) & {
  errors?: readonly { instancePath?: string; message?: string }[] | null;
};
export const batchGetPagesInput: Validator;
export const batchGetPagesOutput: Validator;
export const batchGetPagesOutputFull: Validator;
