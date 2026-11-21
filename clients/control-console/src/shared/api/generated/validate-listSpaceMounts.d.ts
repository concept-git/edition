// Generated from contracts/openapi.json. Do not edit.
type Validator = ((data: unknown) => boolean) & {
  errors?: readonly { instancePath?: string; message?: string }[] | null;
};
export const listSpaceMountsInput: Validator;
export const listSpaceMountsOutput: Validator;
export const listSpaceMountsOutputFull: Validator;
