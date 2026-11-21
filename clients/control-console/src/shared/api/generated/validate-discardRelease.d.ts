// Generated from contracts/openapi.json. Do not edit.
type Validator = ((data: unknown) => boolean) & {
  errors?: readonly { instancePath?: string; message?: string }[] | null;
};
export const discardReleaseInput: Validator;
export const discardReleaseOutput: Validator;
export const discardReleaseOutputFull: Validator;
