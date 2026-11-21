// Generated from contracts/openapi.json. Do not edit.
type Validator = ((data: unknown) => boolean) & {
  errors?: readonly { instancePath?: string; message?: string }[] | null;
};
export const rollbackReleaseInput: Validator;
export const rollbackReleaseOutput: Validator;
export const rollbackReleaseOutputFull: Validator;
