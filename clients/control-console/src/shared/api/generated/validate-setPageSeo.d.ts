// Generated from contracts/openapi.json. Do not edit.
type Validator = ((data: unknown) => boolean) & {
  errors?: readonly { instancePath?: string; message?: string }[] | null;
};
export const setPageSeoInput: Validator;
export const setPageSeoOutput: Validator;
export const setPageSeoOutputFull: Validator;
