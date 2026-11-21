// Generated from contracts/openapi.json. Do not edit.
type Validator = ((data: unknown) => boolean) & {
  errors?: readonly { instancePath?: string; message?: string }[] | null;
};
export const viewPluginVerificationInput: Validator;
export const viewPluginVerificationOutput: Validator;
export const viewPluginVerificationOutputFull: Validator;
