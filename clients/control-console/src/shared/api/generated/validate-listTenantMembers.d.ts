// Generated from contracts/openapi.json. Do not edit.
type Validator = ((data: unknown) => boolean) & {
  errors?: readonly { instancePath?: string; message?: string }[] | null;
};
export const listTenantMembersInput: Validator;
export const listTenantMembersOutput: Validator;
export const listTenantMembersOutputFull: Validator;
