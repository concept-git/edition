// Generated from contracts/openapi.json. Do not edit.
type Validator = ((data: unknown) => boolean) & {
  errors?: readonly { instancePath?: string; message?: string }[] | null;
};
export const listSpacesInput: Validator;
export const listSpacesOutput: Validator;
export const listSpacesOutputFull: Validator;
