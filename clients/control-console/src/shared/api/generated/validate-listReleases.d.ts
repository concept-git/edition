// Generated from contracts/openapi.json. Do not edit.
type Validator = ((data: unknown) => boolean) & {
  errors?: readonly { instancePath?: string; message?: string }[] | null;
};
export const listReleasesInput: Validator;
export const listReleasesOutput: Validator;
export const listReleasesOutputFull: Validator;
