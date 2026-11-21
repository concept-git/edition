// Generated from contracts/openapi.json. Do not edit.
type Validator = ((data: unknown) => boolean) & {
  errors?: readonly { instancePath?: string; message?: string }[] | null;
};
export const viewContentTypeVersionInput: Validator;
export const viewContentTypeVersionOutput: Validator;
export const viewContentTypeVersionOutputFull: Validator;
