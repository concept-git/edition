// Generated from contracts/openapi.json. Do not edit.
type Validator = ((data: unknown) => boolean) & {
  errors?: readonly { instancePath?: string; message?: string }[] | null;
};
export const verifyPluginCandidateInput: Validator;
export const verifyPluginCandidateOutput: Validator;
export const verifyPluginCandidateOutputFull: Validator;
