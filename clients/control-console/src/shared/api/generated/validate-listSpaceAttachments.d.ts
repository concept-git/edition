// Generated from contracts/openapi.json. Do not edit.
type Validator = ((data: unknown) => boolean) & {
  errors?: readonly { instancePath?: string; message?: string }[] | null;
};
export const listSpaceAttachmentsInput: Validator;
export const listSpaceAttachmentsOutput: Validator;
export const listSpaceAttachmentsOutputFull: Validator;
