// Generated from contracts/openapi.json. Do not edit.
type Validator = ((data: unknown) => boolean) & {
  errors?: readonly { instancePath?: string; message?: string }[] | null;
};
export const tagPageInput: Validator;
export const tagPageOutput: Validator;
export const tagPageOutputFull: Validator;
