// Generated from contracts/openapi.json. Do not edit.
type Validator = ((data: unknown) => boolean) & {
  errors?: readonly { instancePath?: string; message?: string }[] | null;
};
export const searchSitePermissionTeamsInput: Validator;
export const searchSitePermissionTeamsOutput: Validator;
export const searchSitePermissionTeamsOutputFull: Validator;
