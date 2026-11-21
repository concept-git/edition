// Generated from contracts/openapi.json. Do not edit.
type Validator = ((data: unknown) => boolean) & {
  errors?: readonly { instancePath?: string; message?: string }[] | null;
};
export const diffPageRevisionsInput: Validator;
export const diffPageRevisionsOutput: Validator;
export const diffPageRevisionsOutputFull: Validator;
