// Generated from contracts/openapi.json. Do not edit.
type Validator = ((data: unknown) => boolean) & {
  errors?: readonly { instancePath?: string; message?: string }[] | null;
};
export const listTenantInvitationsInput: Validator;
export const listTenantInvitationsOutput: Validator;
export const listTenantInvitationsOutputFull: Validator;
