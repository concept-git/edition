// Generated from contracts/openapi.json. Do not edit.
type Validator = ((data: unknown) => boolean) & {
  errors?: readonly { instancePath?: string; message?: string }[] | null;
};
export const viewPageInput: Validator;
export const viewPageOutput: Validator;
export const viewPageOutputFull: Validator;
