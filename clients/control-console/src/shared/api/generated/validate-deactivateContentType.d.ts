// Generated from contracts/openapi.json. Do not edit.
type Validator = ((data: unknown) => boolean) & {
  errors?: readonly { instancePath?: string; message?: string }[] | null;
};
export const deactivateContentTypeInput: Validator;
export const deactivateContentTypeOutput: Validator;
export const deactivateContentTypeOutputFull: Validator;
