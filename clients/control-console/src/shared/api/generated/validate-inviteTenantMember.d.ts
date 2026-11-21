// Generated from contracts/openapi.json. Do not edit.
type Validator = ((data: unknown) => boolean) & {
  errors?: readonly { instancePath?: string; message?: string }[] | null;
};
export const inviteTenantMemberInput: Validator;
export const inviteTenantMemberOutput: Validator;
export const inviteTenantMemberOutputFull: Validator;
