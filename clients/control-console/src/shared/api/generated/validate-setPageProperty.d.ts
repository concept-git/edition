// Generated from contracts/openapi.json. Do not edit.
type Validator = ((data: unknown) => boolean) & {
  errors?: readonly { instancePath?: string; message?: string }[] | null;
};
export const setPagePropertyInput: Validator;
export const setPagePropertyOutput: Validator;
export const setPagePropertyOutputFull: Validator;
