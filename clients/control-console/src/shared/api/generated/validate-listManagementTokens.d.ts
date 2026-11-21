// Generated from contracts/openapi.json. Do not edit.
type Validator = ((data: unknown) => boolean) & {
  errors?: readonly { instancePath?: string; message?: string }[] | null;
};
export const listManagementTokensInput: Validator;
export const listManagementTokensOutput: Validator;
export const listManagementTokensOutputFull: Validator;
