// Generated from contracts/openapi.json. Do not edit.
type Validator = ((data: unknown) => boolean) & {
  errors?: readonly { instancePath?: string; message?: string }[] | null;
};
export const reorderMountsInput: Validator;
export const reorderMountsOutput: Validator;
export const reorderMountsOutputFull: Validator;
