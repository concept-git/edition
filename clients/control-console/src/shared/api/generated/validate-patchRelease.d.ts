// Generated from contracts/openapi.json. Do not edit.
type Validator = ((data: unknown) => boolean) & {
  errors?: readonly { instancePath?: string; message?: string }[] | null;
};
export const patchReleaseInput: Validator;
export const patchReleaseOutput: Validator;
export const patchReleaseOutputFull: Validator;
