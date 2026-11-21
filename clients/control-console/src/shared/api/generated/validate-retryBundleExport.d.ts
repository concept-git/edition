// Generated from contracts/openapi.json. Do not edit.
type Validator = ((data: unknown) => boolean) & {
  errors?: readonly { instancePath?: string; message?: string }[] | null;
};
export const retryBundleExportInput: Validator;
export const retryBundleExportOutput: Validator;
export const retryBundleExportOutputFull: Validator;
