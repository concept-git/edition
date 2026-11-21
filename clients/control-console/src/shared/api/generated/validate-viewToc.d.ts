// Generated from contracts/openapi.json. Do not edit.
type Validator = ((data: unknown) => boolean) & {
  errors?: readonly { instancePath?: string; message?: string }[] | null;
};
export const viewTocInput: Validator;
export const viewTocOutput: Validator;
export const viewTocOutputFull: Validator;
