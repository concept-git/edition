// Generated from contracts/openapi.json. Do not edit.
type Validator = ((data: unknown) => boolean) & {
  errors?: readonly { instancePath?: string; message?: string }[] | null;
};
export const ingestAnalyticsInput: Validator;
export const ingestAnalyticsOutput: Validator;
export const ingestAnalyticsOutputFull: Validator;
