// Generated from contracts/openapi.json. Do not edit.
type Validator = ((data: unknown) => boolean) & {
  errors?: readonly { instancePath?: string; message?: string }[] | null;
};
export const searchConfigurationInput: Validator;
export const searchConfigurationOutput: Validator;
export const searchConfigurationOutputFull: Validator;
