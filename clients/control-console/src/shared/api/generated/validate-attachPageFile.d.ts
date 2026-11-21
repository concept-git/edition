// Generated from contracts/openapi.json. Do not edit.
type Validator = ((data: unknown) => boolean) & {
  errors?: readonly { instancePath?: string; message?: string }[] | null;
};
export const attachPageFileInput: Validator;
export const attachPageFileOutput: Validator;
export const attachPageFileOutputFull: Validator;
