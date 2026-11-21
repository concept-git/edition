// Generated from contracts/openapi.json. Do not edit.
type Validator = ((data: unknown) => boolean) & {
  errors?: readonly { instancePath?: string; message?: string }[] | null;
};
export const requestBundleExportInput: Validator;
export const requestBundleExportOutput: Validator;
export const requestBundleExportOutputFull: Validator;
