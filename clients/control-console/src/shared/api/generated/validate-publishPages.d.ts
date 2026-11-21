// Generated from contracts/openapi.json. Do not edit.
type Validator = ((data: unknown) => boolean) & {
  errors?: readonly { instancePath?: string; message?: string }[] | null;
};
export const publishPagesInput: Validator;
export const publishPagesOutput: Validator;
export const publishPagesOutputFull: Validator;
