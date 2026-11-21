// Generated from contracts/openapi.json. Do not edit.
type Validator = ((data: unknown) => boolean) & {
  errors?: readonly { instancePath?: string; message?: string }[] | null;
};
export const updateSpaceInput: Validator;
export const updateSpaceOutput: Validator;
export const updateSpaceOutputFull: Validator;
