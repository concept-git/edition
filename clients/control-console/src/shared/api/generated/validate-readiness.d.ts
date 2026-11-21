// Generated from contracts/openapi.json. Do not edit.
type Validator = ((data: unknown) => boolean) & {
  errors?: readonly { instancePath?: string; message?: string }[] | null;
};
export const readinessInput: Validator;
export const readinessOutput: Validator;
export const readinessOutputFull: Validator;
