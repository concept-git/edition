// Generated from contracts/openapi.json. Do not edit.
type Validator = ((data: unknown) => boolean) & {
  errors?: readonly { instancePath?: string; message?: string }[] | null;
};
export const listJobsInput: Validator;
export const listJobsOutput: Validator;
export const listJobsOutputFull: Validator;
