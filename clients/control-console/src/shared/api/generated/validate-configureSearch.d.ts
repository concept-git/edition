// Generated from contracts/openapi.json. Do not edit.
type Validator = ((data: unknown) => boolean) & {
  errors?: readonly { instancePath?: string; message?: string }[] | null;
};
export const configureSearchInput: Validator;
export const configureSearchOutput: Validator;
export const configureSearchOutputFull: Validator;
