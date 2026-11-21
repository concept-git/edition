// Generated from contracts/openapi.json. Do not edit.
type Validator = ((data: unknown) => boolean) & {
  errors?: readonly { instancePath?: string; message?: string }[] | null;
};
export const listDeletionsInput: Validator;
export const listDeletionsOutput: Validator;
export const listDeletionsOutputFull: Validator;
