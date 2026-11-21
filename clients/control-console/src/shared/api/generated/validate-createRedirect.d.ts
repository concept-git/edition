// Generated from contracts/openapi.json. Do not edit.
type Validator = ((data: unknown) => boolean) & {
  errors?: readonly { instancePath?: string; message?: string }[] | null;
};
export const createRedirectInput: Validator;
export const createRedirectOutput: Validator;
export const createRedirectOutputFull: Validator;
