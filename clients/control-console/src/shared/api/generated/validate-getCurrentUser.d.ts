// Generated from contracts/openapi.json. Do not edit.
type Validator = ((data: unknown) => boolean) & {
  errors?: readonly { instancePath?: string; message?: string }[] | null;
};
export const getCurrentUserInput: Validator;
export const getCurrentUserOutput: Validator;
export const getCurrentUserOutputFull: Validator;
