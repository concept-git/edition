// Generated from contracts/openapi.json. Do not edit.
type Validator = ((data: unknown) => boolean) & {
  errors?: readonly { instancePath?: string; message?: string }[] | null;
};
export const registerContentTypeVersionInput: Validator;
export const registerContentTypeVersionOutput: Validator;
export const registerContentTypeVersionOutputFull: Validator;
