// Generated from contracts/openapi.json. Do not edit.
type Validator = ((data: unknown) => boolean) & {
  errors?: readonly { instancePath?: string; message?: string }[] | null;
};
export const healthInput: Validator;
export const healthOutput: Validator;
export const healthOutputFull: Validator;
