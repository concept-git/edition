// Generated from contracts/openapi.json. Do not edit.
type Validator = ((data: unknown) => boolean) & {
  errors?: readonly { instancePath?: string; message?: string }[] | null;
};
export const untagPageInput: Validator;
export const untagPageOutput: Validator;
export const untagPageOutputFull: Validator;
