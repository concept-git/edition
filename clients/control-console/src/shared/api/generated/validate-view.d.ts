// Generated from contracts/openapi.json. Do not edit.
type Validator = ((data: unknown) => boolean) & {
  errors?: readonly { instancePath?: string; message?: string }[] | null;
};
export const viewInput: Validator;
export const viewOutput: Validator;
export const viewOutputFull: Validator;
