// Generated from contracts/openapi.json. Do not edit.
type Validator = ((data: unknown) => boolean) & {
  errors?: readonly { instancePath?: string; message?: string }[] | null;
};
export const placeSpaceInput: Validator;
export const placeSpaceOutput: Validator;
export const placeSpaceOutputFull: Validator;
