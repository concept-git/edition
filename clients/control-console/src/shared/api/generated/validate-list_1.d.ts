// Generated from contracts/openapi.json. Do not edit.
type Validator = ((data: unknown) => boolean) & {
  errors?: readonly { instancePath?: string; message?: string }[] | null;
};
export const list_1Input: Validator;
export const list_1Output: Validator;
export const list_1OutputFull: Validator;
