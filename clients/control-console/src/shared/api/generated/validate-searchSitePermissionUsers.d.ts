// Generated from contracts/openapi.json. Do not edit.
type Validator = ((data: unknown) => boolean) & {
  errors?: readonly { instancePath?: string; message?: string }[] | null;
};
export const searchSitePermissionUsersInput: Validator;
export const searchSitePermissionUsersOutput: Validator;
export const searchSitePermissionUsersOutputFull: Validator;
