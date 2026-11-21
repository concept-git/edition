// Generated from contracts/openapi.json. Do not edit.
type Validator = ((data: unknown) => boolean) & {
  errors?: readonly { instancePath?: string; message?: string }[] | null;
};
export const publishPageInput: Validator;
export const publishPageOutput: Validator;
export const publishPageOutputFull: Validator;
