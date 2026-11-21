// Generated from contracts/openapi.json. Do not edit.
type Validator = ((data: unknown) => boolean) & {
  errors?: readonly { instancePath?: string; message?: string }[] | null;
};
export const moveCollectionInput: Validator;
export const moveCollectionOutput: Validator;
export const moveCollectionOutputFull: Validator;
