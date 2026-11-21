// Generated from contracts/openapi.json. Do not edit.
type Validator = ((data: unknown) => boolean) & {
  errors?: readonly { instancePath?: string; message?: string }[] | null;
};
export const viewPluginDevelopmentInput: Validator;
export const viewPluginDevelopmentOutput: Validator;
export const viewPluginDevelopmentOutputFull: Validator;
