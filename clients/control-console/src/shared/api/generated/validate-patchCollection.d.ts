// Generated from contracts/openapi.json. Do not edit.
type Validator = ((data: unknown) => boolean) & {
  errors?: readonly { instancePath?: string; message?: string }[] | null;
};
export const patchCollectionInput: Validator;
export const patchCollectionOutput: Validator;
export const patchCollectionOutputFull: Validator;
