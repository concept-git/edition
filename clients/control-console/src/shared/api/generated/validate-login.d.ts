// Generated from contracts/openapi.json. Do not edit.
type Validator = ((data: unknown) => boolean) & {
  errors?: readonly { instancePath?: string; message?: string }[] | null;
};
export const loginInput: Validator;
export const loginOutput: Validator;
export const loginOutputFull: Validator;
