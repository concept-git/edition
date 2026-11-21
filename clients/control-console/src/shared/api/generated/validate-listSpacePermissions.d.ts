// Generated from contracts/openapi.json. Do not edit.
type Validator = ((data: unknown) => boolean) & {
  errors?: readonly { instancePath?: string; message?: string }[] | null;
};
export const listSpacePermissionsInput: Validator;
export const listSpacePermissionsOutput: Validator;
export const listSpacePermissionsOutputFull: Validator;
