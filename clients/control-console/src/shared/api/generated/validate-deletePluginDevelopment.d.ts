// Generated from contracts/openapi.json. Do not edit.
type Validator = ((data: unknown) => boolean) & {
  errors?: readonly { instancePath?: string; message?: string }[] | null;
};
export const deletePluginDevelopmentInput: Validator;
export const deletePluginDevelopmentOutput: Validator;
export const deletePluginDevelopmentOutputFull: Validator;
