// Generated from contracts/openapi.json. Do not edit.
type Validator = ((data: unknown) => boolean) & {
  errors?: readonly { instancePath?: string; message?: string }[] | null;
};
export const reindexSearchInput: Validator;
export const reindexSearchOutput: Validator;
export const reindexSearchOutputFull: Validator;
