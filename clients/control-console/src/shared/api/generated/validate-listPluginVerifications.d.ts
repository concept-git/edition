// Generated from contracts/openapi.json. Do not edit.
type Validator = ((data: unknown) => boolean) & {
  errors?: readonly { instancePath?: string; message?: string }[] | null;
};
export const listPluginVerificationsInput: Validator;
export const listPluginVerificationsOutput: Validator;
export const listPluginVerificationsOutputFull: Validator;
