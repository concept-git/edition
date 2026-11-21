// Generated from contracts/openapi.json. Do not edit.
type Validator = ((data: unknown) => boolean) & {
  errors?: readonly { instancePath?: string; message?: string }[] | null;
};
export const deleteSiteInput: Validator;
export const deleteSiteOutput: Validator;
export const deleteSiteOutputFull: Validator;
