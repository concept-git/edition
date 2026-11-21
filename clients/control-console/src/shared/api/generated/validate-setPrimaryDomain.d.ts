// Generated from contracts/openapi.json. Do not edit.
type Validator = ((data: unknown) => boolean) & {
  errors?: readonly { instancePath?: string; message?: string }[] | null;
};
export const setPrimaryDomainInput: Validator;
export const setPrimaryDomainOutput: Validator;
export const setPrimaryDomainOutputFull: Validator;
