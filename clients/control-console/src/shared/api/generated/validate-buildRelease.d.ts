// Generated from contracts/openapi.json. Do not edit.
type Validator = ((data: unknown) => boolean) & {
  errors?: readonly { instancePath?: string; message?: string }[] | null;
};
export const buildReleaseInput: Validator;
export const buildReleaseOutput: Validator;
export const buildReleaseOutputFull: Validator;
