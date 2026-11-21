// Generated from contracts/openapi.json. Do not edit.
type Validator = ((data: unknown) => boolean) & {
  errors?: readonly { instancePath?: string; message?: string }[] | null;
};
export const registerInput: Validator;
export const registerOutput: Validator;
export const registerOutputFull: Validator;
