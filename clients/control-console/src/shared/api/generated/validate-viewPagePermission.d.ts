// Generated from contracts/openapi.json. Do not edit.
type Validator = ((data: unknown) => boolean) & {
  errors?: readonly { instancePath?: string; message?: string }[] | null;
};
export const viewPagePermissionInput: Validator;
export const viewPagePermissionOutput: Validator;
export const viewPagePermissionOutputFull: Validator;
