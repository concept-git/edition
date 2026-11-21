// Generated from contracts/openapi.json. Do not edit.
type Validator = ((data: unknown) => boolean) & {
  errors?: readonly { instancePath?: string; message?: string }[] | null;
};
export const createPageInput: Validator;
export const createPageOutput: Validator;
export const createPageOutputFull: Validator;
