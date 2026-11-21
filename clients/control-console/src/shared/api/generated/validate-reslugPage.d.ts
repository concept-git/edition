// Generated from contracts/openapi.json. Do not edit.
type Validator = ((data: unknown) => boolean) & {
  errors?: readonly { instancePath?: string; message?: string }[] | null;
};
export const reslugPageInput: Validator;
export const reslugPageOutput: Validator;
export const reslugPageOutputFull: Validator;
