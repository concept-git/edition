// Generated from contracts/openapi.json. Do not edit.
type Validator = ((data: unknown) => boolean) & {
  errors?: readonly { instancePath?: string; message?: string }[] | null;
};
export const previewInvitationInput: Validator;
export const previewInvitationOutput: Validator;
export const previewInvitationOutputFull: Validator;
