// Generated from contracts/openapi.json. Do not edit.
type Validator = ((data: unknown) => boolean) & {
  errors?: readonly { instancePath?: string; message?: string }[] | null;
};
export const listPagesInput: Validator;
export const listPagesOutput: Validator;
export const listPagesOutputFull: Validator;
