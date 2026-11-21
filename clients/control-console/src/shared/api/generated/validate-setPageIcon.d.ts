// Generated from contracts/openapi.json. Do not edit.
type Validator = ((data: unknown) => boolean) & {
  errors?: readonly { instancePath?: string; message?: string }[] | null;
};
export const setPageIconInput: Validator;
export const setPageIconOutput: Validator;
export const setPageIconOutputFull: Validator;
