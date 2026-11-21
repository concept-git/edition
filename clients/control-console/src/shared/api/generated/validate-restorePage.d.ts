// Generated from contracts/openapi.json. Do not edit.
type Validator = ((data: unknown) => boolean) & {
  errors?: readonly { instancePath?: string; message?: string }[] | null;
};
export const restorePageInput: Validator;
export const restorePageOutput: Validator;
export const restorePageOutputFull: Validator;
