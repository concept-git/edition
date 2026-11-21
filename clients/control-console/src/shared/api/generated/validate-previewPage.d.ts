// Generated from contracts/openapi.json. Do not edit.
type Validator = ((data: unknown) => boolean) & {
  errors?: readonly { instancePath?: string; message?: string }[] | null;
};
export const previewPageInput: Validator;
export const previewPageOutput: Validator;
export const previewPageOutputFull: Validator;
