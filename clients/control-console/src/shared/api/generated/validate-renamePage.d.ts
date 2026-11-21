// Generated from contracts/openapi.json. Do not edit.
type Validator = ((data: unknown) => boolean) & {
  errors?: readonly { instancePath?: string; message?: string }[] | null;
};
export const renamePageInput: Validator;
export const renamePageOutput: Validator;
export const renamePageOutputFull: Validator;
