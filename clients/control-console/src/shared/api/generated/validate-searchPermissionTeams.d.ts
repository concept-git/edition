// Generated from contracts/openapi.json. Do not edit.
type Validator = ((data: unknown) => boolean) & {
  errors?: readonly { instancePath?: string; message?: string }[] | null;
};
export const searchPermissionTeamsInput: Validator;
export const searchPermissionTeamsOutput: Validator;
export const searchPermissionTeamsOutputFull: Validator;
