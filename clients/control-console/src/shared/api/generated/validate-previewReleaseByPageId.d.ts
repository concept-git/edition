// Generated from contracts/openapi.json. Do not edit.
type Validator = ((data: unknown) => boolean) & {
  errors?: readonly { instancePath?: string; message?: string }[] | null;
};
export const previewReleaseByPageIdInput: Validator;
export const previewReleaseByPageIdOutput: Validator;
export const previewReleaseByPageIdOutputFull: Validator;
