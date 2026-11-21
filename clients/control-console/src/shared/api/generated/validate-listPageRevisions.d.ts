// Generated from contracts/openapi.json. Do not edit.
type Validator = ((data: unknown) => boolean) & {
  errors?: readonly { instancePath?: string; message?: string }[] | null;
};
export const listPageRevisionsInput: Validator;
export const listPageRevisionsOutput: Validator;
export const listPageRevisionsOutputFull: Validator;
