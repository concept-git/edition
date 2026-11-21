// Generated from contracts/openapi.json. Do not edit.
type Validator = ((data: unknown) => boolean) & {
  errors?: readonly { instancePath?: string; message?: string }[] | null;
};
export const createSiteInput: Validator;
export const createSiteOutput: Validator;
export const createSiteOutputFull: Validator;
