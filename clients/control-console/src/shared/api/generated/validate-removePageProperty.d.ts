// Generated from contracts/openapi.json. Do not edit.
type Validator = ((data: unknown) => boolean) & {
  errors?: readonly { instancePath?: string; message?: string }[] | null;
};
export const removePagePropertyInput: Validator;
export const removePagePropertyOutput: Validator;
export const removePagePropertyOutputFull: Validator;
