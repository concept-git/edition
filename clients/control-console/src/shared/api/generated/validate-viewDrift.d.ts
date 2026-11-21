// Generated from contracts/openapi.json. Do not edit.
type Validator = ((data: unknown) => boolean) & {
  errors?: readonly { instancePath?: string; message?: string }[] | null;
};
export const viewDriftInput: Validator;
export const viewDriftOutput: Validator;
export const viewDriftOutputFull: Validator;
