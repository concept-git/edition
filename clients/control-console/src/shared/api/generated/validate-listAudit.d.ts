// Generated from contracts/openapi.json. Do not edit.
type Validator = ((data: unknown) => boolean) & {
  errors?: readonly { instancePath?: string; message?: string }[] | null;
};
export const listAuditInput: Validator;
export const listAuditOutput: Validator;
export const listAuditOutputFull: Validator;
