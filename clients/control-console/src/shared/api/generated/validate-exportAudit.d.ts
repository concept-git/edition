// Generated from contracts/openapi.json. Do not edit.
type Validator = ((data: unknown) => boolean) & {
  errors?: readonly { instancePath?: string; message?: string }[] | null;
};
export const exportAuditInput: Validator;
export const exportAuditOutput: Validator;
export const exportAuditOutputFull: Validator;
