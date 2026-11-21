// Generated from contracts/openapi.json. Do not edit.
type Validator = ((data: unknown) => boolean) & {
  errors?: readonly { instancePath?: string; message?: string }[] | null;
};
export const deletePageRestrictionInput: Validator;
export const deletePageRestrictionOutput: Validator;
export const deletePageRestrictionOutputFull: Validator;
