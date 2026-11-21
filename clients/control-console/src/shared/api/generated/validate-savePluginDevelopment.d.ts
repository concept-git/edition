// Generated from contracts/openapi.json. Do not edit.
type Validator = ((data: unknown) => boolean) & {
  errors?: readonly { instancePath?: string; message?: string }[] | null;
};
export const savePluginDevelopmentInput: Validator;
export const savePluginDevelopmentOutput: Validator;
export const savePluginDevelopmentOutputFull: Validator;
