// Generated from contracts/openapi.json. Do not edit.
type Validator = ((data: unknown) => boolean) & {
  errors?: readonly { instancePath?: string; message?: string }[] | null;
};
export const promoteReleaseInput: Validator;
export const promoteReleaseOutput: Validator;
export const promoteReleaseOutputFull: Validator;
