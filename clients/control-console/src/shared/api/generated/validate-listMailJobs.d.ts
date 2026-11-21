// Generated from contracts/openapi.json. Do not edit.
type Validator = ((data: unknown) => boolean) & {
  errors?: readonly { instancePath?: string; message?: string }[] | null;
};
export const listMailJobsInput: Validator;
export const listMailJobsOutput: Validator;
export const listMailJobsOutputFull: Validator;
