// Generated from contracts/openapi.json. Do not edit.
type Validator = ((data: unknown) => boolean) & {
  errors?: readonly { instancePath?: string; message?: string }[] | null;
};
export const renameInput: Validator;
export const renameOutput: Validator;
export const renameOutputFull: Validator;
