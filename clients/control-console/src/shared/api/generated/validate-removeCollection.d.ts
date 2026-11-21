// Generated from contracts/openapi.json. Do not edit.
type Validator = ((data: unknown) => boolean) & {
  errors?: readonly { instancePath?: string; message?: string }[] | null;
};
export const removeCollectionInput: Validator;
export const removeCollectionOutput: Validator;
export const removeCollectionOutputFull: Validator;
