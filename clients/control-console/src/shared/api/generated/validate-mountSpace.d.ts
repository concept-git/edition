// Generated from contracts/openapi.json. Do not edit.
type Validator = ((data: unknown) => boolean) & {
  errors?: readonly { instancePath?: string; message?: string }[] | null;
};
export const mountSpaceInput: Validator;
export const mountSpaceOutput: Validator;
export const mountSpaceOutputFull: Validator;
