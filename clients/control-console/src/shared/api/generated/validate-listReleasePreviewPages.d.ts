// Generated from contracts/openapi.json. Do not edit.
type Validator = ((data: unknown) => boolean) & {
  errors?: readonly { instancePath?: string; message?: string }[] | null;
};
export const listReleasePreviewPagesInput: Validator;
export const listReleasePreviewPagesOutput: Validator;
export const listReleasePreviewPagesOutputFull: Validator;
