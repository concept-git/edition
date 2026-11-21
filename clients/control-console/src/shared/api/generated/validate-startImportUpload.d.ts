// Generated from contracts/openapi.json. Do not edit.
type Validator = ((data: unknown) => boolean) & {
  errors?: readonly { instancePath?: string; message?: string }[] | null;
};
export const startImportUploadInput: Validator;
export const startImportUploadOutput: Validator;
export const startImportUploadOutputFull: Validator;
