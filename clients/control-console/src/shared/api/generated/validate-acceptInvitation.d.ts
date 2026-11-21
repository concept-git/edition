// Generated from contracts/openapi.json. Do not edit.
type Validator = ((data: unknown) => boolean) & {
  errors?: readonly { instancePath?: string; message?: string }[] | null;
};
export const acceptInvitationInput: Validator;
export const acceptInvitationOutput: Validator;
export const acceptInvitationOutputFull: Validator;
