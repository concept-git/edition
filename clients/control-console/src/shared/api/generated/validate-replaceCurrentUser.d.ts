// Generated from contracts/openapi.json. Do not edit.
type Validator = ((data: unknown) => boolean) & {
  errors?: readonly { instancePath?: string; message?: string }[] | null;
};
export const replaceCurrentUserInput: Validator;
export const replaceCurrentUserOutput: Validator;
export const replaceCurrentUserOutputFull: Validator;
