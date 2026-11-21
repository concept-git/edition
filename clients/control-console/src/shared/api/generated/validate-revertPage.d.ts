// Generated from contracts/openapi.json. Do not edit.
type Validator = ((data: unknown) => boolean) & {
  errors?: readonly { instancePath?: string; message?: string }[] | null;
};
export const revertPageInput: Validator;
export const revertPageOutput: Validator;
export const revertPageOutputFull: Validator;
