// Generated from contracts/openapi.json. Do not edit.
type Validator = ((data: unknown) => boolean) & {
  errors?: readonly { instancePath?: string; message?: string }[] | null;
};
export const createPluginDevelopmentInput: Validator;
export const createPluginDevelopmentOutput: Validator;
export const createPluginDevelopmentOutputFull: Validator;
