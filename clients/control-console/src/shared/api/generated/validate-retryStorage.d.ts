// Generated from contracts/openapi.json. Do not edit.
type Validator = ((data: unknown) => boolean) & {
  errors?: readonly { instancePath?: string; message?: string }[] | null;
};
export const retryStorageInput: Validator;
export const retryStorageOutput: Validator;
export const retryStorageOutputFull: Validator;
