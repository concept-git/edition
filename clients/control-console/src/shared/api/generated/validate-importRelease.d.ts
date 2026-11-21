// Generated from contracts/openapi.json. Do not edit.
type Validator = ((data: unknown) => boolean) & {
  errors?: readonly { instancePath?: string; message?: string }[] | null;
};
export const importReleaseInput: Validator;
export const importReleaseOutput: Validator;
export const importReleaseOutputFull: Validator;
