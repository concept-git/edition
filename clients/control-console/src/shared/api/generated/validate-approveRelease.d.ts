// Generated from contracts/openapi.json. Do not edit.
type Validator = ((data: unknown) => boolean) & {
  errors?: readonly { instancePath?: string; message?: string }[] | null;
};
export const approveReleaseInput: Validator;
export const approveReleaseOutput: Validator;
export const approveReleaseOutputFull: Validator;
