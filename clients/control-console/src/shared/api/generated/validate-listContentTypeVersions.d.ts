// Generated from contracts/openapi.json. Do not edit.
type Validator = ((data: unknown) => boolean) & {
  errors?: readonly { instancePath?: string; message?: string }[] | null;
};
export const listContentTypeVersionsInput: Validator;
export const listContentTypeVersionsOutput: Validator;
export const listContentTypeVersionsOutputFull: Validator;
