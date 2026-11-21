// Generated from contracts/openapi.json. Do not edit.
type Validator = ((data: unknown) => boolean) & {
  errors?: readonly { instancePath?: string; message?: string }[] | null;
};
export const refreshSessionInput: Validator;
export const refreshSessionOutput: Validator;
export const refreshSessionOutputFull: Validator;
