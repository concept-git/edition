// Generated from contracts/openapi.json. Do not edit.
type Validator = ((data: unknown) => boolean) & {
  errors?: readonly { instancePath?: string; message?: string }[] | null;
};
export const viewSpaceInput: Validator;
export const viewSpaceOutput: Validator;
export const viewSpaceOutputFull: Validator;
