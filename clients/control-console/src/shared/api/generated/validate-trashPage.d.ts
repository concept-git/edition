// Generated from contracts/openapi.json. Do not edit.
type Validator = ((data: unknown) => boolean) & {
  errors?: readonly { instancePath?: string; message?: string }[] | null;
};
export const trashPageInput: Validator;
export const trashPageOutput: Validator;
export const trashPageOutputFull: Validator;
