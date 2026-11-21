// Generated from contracts/openapi.json. Do not edit.
type Validator = ((data: unknown) => boolean) & {
  errors?: readonly { instancePath?: string; message?: string }[] | null;
};
export const listInput: Validator;
export const listOutput: Validator;
export const listOutputFull: Validator;
