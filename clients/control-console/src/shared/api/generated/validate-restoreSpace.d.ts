// Generated from contracts/openapi.json. Do not edit.
type Validator = ((data: unknown) => boolean) & {
  errors?: readonly { instancePath?: string; message?: string }[] | null;
};
export const restoreSpaceInput: Validator;
export const restoreSpaceOutput: Validator;
export const restoreSpaceOutputFull: Validator;
