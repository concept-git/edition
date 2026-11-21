// Generated from contracts/openapi.json. Do not edit.
type Validator = ((data: unknown) => boolean) & {
  errors?: readonly { instancePath?: string; message?: string }[] | null;
};
export const convertSpaceInput: Validator;
export const convertSpaceOutput: Validator;
export const convertSpaceOutputFull: Validator;
