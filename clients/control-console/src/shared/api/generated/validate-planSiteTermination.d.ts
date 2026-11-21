// Generated from contracts/openapi.json. Do not edit.
type Validator = ((data: unknown) => boolean) & {
  errors?: readonly { instancePath?: string; message?: string }[] | null;
};
export const planSiteTerminationInput: Validator;
export const planSiteTerminationOutput: Validator;
export const planSiteTerminationOutputFull: Validator;
