// Generated from contracts/openapi.json. Do not edit.
type Validator = ((data: unknown) => boolean) & {
  errors?: readonly { instancePath?: string; message?: string }[] | null;
};
export const getAdminUserInput: Validator;
export const getAdminUserOutput: Validator;
export const getAdminUserOutputFull: Validator;
