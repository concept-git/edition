// Generated from contracts/openapi.json. Do not edit.
type Validator = ((data: unknown) => boolean) & {
  errors?: readonly { instancePath?: string; message?: string }[] | null;
};
export const viewPageAttachmentInput: Validator;
export const viewPageAttachmentOutput: Validator;
export const viewPageAttachmentOutputFull: Validator;
