// Generated from contracts/openapi.json. Do not edit.
type Validator = ((data: unknown) => boolean) & {
  errors?: readonly { instancePath?: string; message?: string }[] | null;
};
export const putPageRestrictionInput: Validator;
export const putPageRestrictionOutput: Validator;
export const putPageRestrictionOutputFull: Validator;
