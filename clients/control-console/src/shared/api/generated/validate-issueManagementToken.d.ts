// Generated from contracts/openapi.json. Do not edit.
type Validator = ((data: unknown) => boolean) & {
  errors?: readonly { instancePath?: string; message?: string }[] | null;
};
export const issueManagementTokenInput: Validator;
export const issueManagementTokenOutput: Validator;
export const issueManagementTokenOutputFull: Validator;
