// Generated from contracts/openapi.json. Do not edit.
type Validator = ((data: unknown) => boolean) & {
  errors?: readonly { instancePath?: string; message?: string }[] | null;
};
export const viewDomainInput: Validator;
export const viewDomainOutput: Validator;
export const viewDomainOutputFull: Validator;
