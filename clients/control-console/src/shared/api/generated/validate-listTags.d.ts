// Generated from contracts/openapi.json. Do not edit.
type Validator = ((data: unknown) => boolean) & {
  errors?: readonly { instancePath?: string; message?: string }[] | null;
};
export const listTagsInput: Validator;
export const listTagsOutput: Validator;
export const listTagsOutputFull: Validator;
