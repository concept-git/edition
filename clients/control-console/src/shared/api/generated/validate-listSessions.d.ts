// Generated from contracts/openapi.json. Do not edit.
type Validator = ((data: unknown) => boolean) & {
  errors?: readonly { instancePath?: string; message?: string }[] | null;
};
export const listSessionsInput: Validator;
export const listSessionsOutput: Validator;
export const listSessionsOutputFull: Validator;
