// Generated from contracts/openapi.json. Do not edit.
type Validator = ((data: unknown) => boolean) & {
  errors?: readonly { instancePath?: string; message?: string }[] | null;
};
export const platformHealthInput: Validator;
export const platformHealthOutput: Validator;
export const platformHealthOutputFull: Validator;
