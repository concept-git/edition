// Generated from contracts/openapi.json. Do not edit.
type Validator = ((data: unknown) => boolean) & {
  errors?: readonly { instancePath?: string; message?: string }[] | null;
};
export const searchAdminUsersInput: Validator;
export const searchAdminUsersOutput: Validator;
export const searchAdminUsersOutputFull: Validator;
