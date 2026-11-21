// Generated from contracts/openapi.json. Do not edit.
type Validator = ((data: unknown) => boolean) & {
  errors?: readonly { instancePath?: string; message?: string }[] | null;
};
export const listPermissionPagesInput: Validator;
export const listPermissionPagesOutput: Validator;
export const listPermissionPagesOutputFull: Validator;
