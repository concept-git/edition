// Generated from contracts/openapi.json. Do not edit.
type Validator = ((data: unknown) => boolean) & {
  errors?: readonly { instancePath?: string; message?: string }[] | null;
};
export const createCollectionInput: Validator;
export const createCollectionOutput: Validator;
export const createCollectionOutputFull: Validator;
