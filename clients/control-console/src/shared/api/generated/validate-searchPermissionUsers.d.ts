// Generated from contracts/openapi.json. Do not edit.
type Validator = ((data: unknown) => boolean) & {
  errors?: readonly { instancePath?: string; message?: string }[] | null;
};
export const searchPermissionUsersInput: Validator;
export const searchPermissionUsersOutput: Validator;
export const searchPermissionUsersOutputFull: Validator;
