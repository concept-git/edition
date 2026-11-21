// Generated from contracts/openapi.json. Do not edit.
type Validator = ((data: unknown) => boolean) & {
  errors?: readonly { instancePath?: string; message?: string }[] | null;
};
export const siteSearchStatsInput: Validator;
export const siteSearchStatsOutput: Validator;
export const siteSearchStatsOutputFull: Validator;
