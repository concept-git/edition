// Generated from contracts/openapi.json. Do not edit.
type Validator = ((data: unknown) => boolean) & {
  errors?: readonly { instancePath?: string; message?: string }[] | null;
};
export const listPluginCandidatesInput: Validator;
export const listPluginCandidatesOutput: Validator;
export const listPluginCandidatesOutputFull: Validator;
