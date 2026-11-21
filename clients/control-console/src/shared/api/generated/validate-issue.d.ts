// Generated from contracts/openapi.json. Do not edit.
type Validator = ((data: unknown) => boolean) & {
  errors?: readonly { instancePath?: string; message?: string }[] | null;
};
export const issueInput: Validator;
export const issueOutput: Validator;
export const issueOutputFull: Validator;
