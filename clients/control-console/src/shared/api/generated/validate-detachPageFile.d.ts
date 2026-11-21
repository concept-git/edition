// Generated from contracts/openapi.json. Do not edit.
type Validator = ((data: unknown) => boolean) & {
  errors?: readonly { instancePath?: string; message?: string }[] | null;
};
export const detachPageFileInput: Validator;
export const detachPageFileOutput: Validator;
export const detachPageFileOutputFull: Validator;
