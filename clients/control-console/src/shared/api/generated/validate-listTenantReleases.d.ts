// Generated from contracts/openapi.json. Do not edit.
type Validator = ((data: unknown) => boolean) & {
  errors?: readonly { instancePath?: string; message?: string }[] | null;
};
export const listTenantReleasesInput: Validator;
export const listTenantReleasesOutput: Validator;
export const listTenantReleasesOutputFull: Validator;
