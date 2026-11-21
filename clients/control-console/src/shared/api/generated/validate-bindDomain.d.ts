// Generated from contracts/openapi.json. Do not edit.
type Validator = ((data: unknown) => boolean) & {
  errors?: readonly { instancePath?: string; message?: string }[] | null;
};
export const bindDomainInput: Validator;
export const bindDomainOutput: Validator;
export const bindDomainOutputFull: Validator;
