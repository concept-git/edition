// Generated from contracts/openapi.json. Do not edit.
type Validator = ((data: unknown) => boolean) & {
  errors?: readonly { instancePath?: string; message?: string }[] | null;
};
export const activateContentTypeInput: Validator;
export const activateContentTypeOutput: Validator;
export const activateContentTypeOutputFull: Validator;
