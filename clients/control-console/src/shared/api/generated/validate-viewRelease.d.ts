// Generated from contracts/openapi.json. Do not edit.
type Validator = ((data: unknown) => boolean) & {
  errors?: readonly { instancePath?: string; message?: string }[] | null;
};
export const viewReleaseInput: Validator;
export const viewReleaseOutput: Validator;
export const viewReleaseOutputFull: Validator;
