// Generated from contracts/openapi.json. Do not edit.
type Validator = ((data: unknown) => boolean) & {
  errors?: readonly { instancePath?: string; message?: string }[] | null;
};
export const updateSiteInput: Validator;
export const updateSiteOutput: Validator;
export const updateSiteOutputFull: Validator;
