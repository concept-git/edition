// Generated from contracts/openapi.json. Do not edit.
type Validator = ((data: unknown) => boolean) & {
  errors?: readonly { instancePath?: string; message?: string }[] | null;
};
export const diffReleasesInput: Validator;
export const diffReleasesOutput: Validator;
export const diffReleasesOutputFull: Validator;
