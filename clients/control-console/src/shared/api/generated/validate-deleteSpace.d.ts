// Generated from contracts/openapi.json. Do not edit.
type Validator = ((data: unknown) => boolean) & {
  errors?: readonly { instancePath?: string; message?: string }[] | null;
};
export const deleteSpaceInput: Validator;
export const deleteSpaceOutput: Validator;
export const deleteSpaceOutputFull: Validator;
