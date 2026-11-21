// Generated from contracts/openapi.json. Do not edit.
type Validator = ((data: unknown) => boolean) & {
  errors?: readonly { instancePath?: string; message?: string }[] | null;
};
export const verifyDomainInput: Validator;
export const verifyDomainOutput: Validator;
export const verifyDomainOutputFull: Validator;
