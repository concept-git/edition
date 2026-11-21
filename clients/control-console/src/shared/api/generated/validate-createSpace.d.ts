// Generated from contracts/openapi.json. Do not edit.
type Validator = ((data: unknown) => boolean) & {
  errors?: readonly { instancePath?: string; message?: string }[] | null;
};
export const createSpaceInput: Validator;
export const createSpaceOutput: Validator;
export const createSpaceOutputFull: Validator;
