// Generated from contracts/openapi.json. Do not edit.
type Validator = ((data: unknown) => boolean) & {
  errors?: readonly { instancePath?: string; message?: string }[] | null;
};
export const siteTrafficInput: Validator;
export const siteTrafficOutput: Validator;
export const siteTrafficOutputFull: Validator;
