// Generated from contracts/openapi.json. Do not edit.
type Validator = ((data: unknown) => boolean) & {
  errors?: readonly { instancePath?: string; message?: string }[] | null;
};
export const renameTagInput: Validator;
export const renameTagOutput: Validator;
export const renameTagOutputFull: Validator;
