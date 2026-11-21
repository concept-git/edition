// Generated from contracts/openapi.json. Do not edit.
type Validator = ((data: unknown) => boolean) & {
  errors?: readonly { instancePath?: string; message?: string }[] | null;
};
export const viewBundleExportInput: Validator;
export const viewBundleExportOutput: Validator;
export const viewBundleExportOutputFull: Validator;
