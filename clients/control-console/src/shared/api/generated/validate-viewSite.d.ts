// Generated from contracts/openapi.json. Do not edit.
type Validator = ((data: unknown) => boolean) & {
  errors?: readonly { instancePath?: string; message?: string }[] | null;
};
export const viewSiteInput: Validator;
export const viewSiteOutput: Validator;
export const viewSiteOutputFull: Validator;
