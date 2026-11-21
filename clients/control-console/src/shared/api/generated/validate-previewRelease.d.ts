// Generated from contracts/openapi.json. Do not edit.
type Validator = ((data: unknown) => boolean) & {
  errors?: readonly { instancePath?: string; message?: string }[] | null;
};
export const previewReleaseInput: Validator;
export const previewReleaseOutput: Validator;
export const previewReleaseOutputFull: Validator;
