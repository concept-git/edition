// Generated from contracts/openapi.json. Do not edit.
type Validator = ((data: unknown) => boolean) & {
  errors?: readonly { instancePath?: string; message?: string }[] | null;
};
export const remountSpaceInput: Validator;
export const remountSpaceOutput: Validator;
export const remountSpaceOutputFull: Validator;
