// Generated from contracts/openapi.json. Do not edit.
type Validator = ((data: unknown) => boolean) & {
  errors?: readonly { instancePath?: string; message?: string }[] | null;
};
export const explainSiteAdminInput: Validator;
export const explainSiteAdminOutput: Validator;
export const explainSiteAdminOutputFull: Validator;
