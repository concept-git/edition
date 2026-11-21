// Generated from contracts/openapi.json. Do not edit.
type Validator = ((data: unknown) => boolean) & {
  errors?: readonly { instancePath?: string; message?: string }[] | null;
};
export const listPluginDevelopmentsInput: Validator;
export const listPluginDevelopmentsOutput: Validator;
export const listPluginDevelopmentsOutputFull: Validator;
