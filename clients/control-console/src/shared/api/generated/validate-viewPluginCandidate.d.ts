// Generated from contracts/openapi.json. Do not edit.
type Validator = ((data: unknown) => boolean) & {
  errors?: readonly { instancePath?: string; message?: string }[] | null;
};
export const viewPluginCandidateInput: Validator;
export const viewPluginCandidateOutput: Validator;
export const viewPluginCandidateOutputFull: Validator;
