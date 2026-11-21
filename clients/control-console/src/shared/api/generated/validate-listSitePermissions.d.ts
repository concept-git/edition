// Generated from contracts/openapi.json. Do not edit.
type Validator = ((data: unknown) => boolean) & {
  errors?: readonly { instancePath?: string; message?: string }[] | null;
};
export const listSitePermissionsInput: Validator;
export const listSitePermissionsOutput: Validator;
export const listSitePermissionsOutputFull: Validator;
