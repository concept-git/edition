// Generated from contracts/openapi.json. Do not edit.
type Validator = ((data: unknown) => boolean) & {
  errors?: readonly { instancePath?: string; message?: string }[] | null;
};
export const editPageInput: Validator;
export const editPageOutput: Validator;
export const editPageOutputFull: Validator;
