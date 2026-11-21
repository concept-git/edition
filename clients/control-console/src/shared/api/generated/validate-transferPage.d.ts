// Generated from contracts/openapi.json. Do not edit.
type Validator = ((data: unknown) => boolean) & {
  errors?: readonly { instancePath?: string; message?: string }[] | null;
};
export const transferPageInput: Validator;
export const transferPageOutput: Validator;
export const transferPageOutputFull: Validator;
