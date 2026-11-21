// Generated from contracts/openapi.json. Do not edit.
type Validator = ((data: unknown) => boolean) & {
  errors?: readonly { instancePath?: string; message?: string }[] | null;
};
export const listRedirectsInput: Validator;
export const listRedirectsOutput: Validator;
export const listRedirectsOutputFull: Validator;
