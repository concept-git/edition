// Generated from contracts/openapi.json. Do not edit.
type Validator = ((data: unknown) => boolean) & {
  errors?: readonly { instancePath?: string; message?: string }[] | null;
};
export const viewAuditExportInput: Validator;
export const viewAuditExportOutput: Validator;
export const viewAuditExportOutputFull: Validator;
