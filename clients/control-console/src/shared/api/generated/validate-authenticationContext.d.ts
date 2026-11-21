// Generated from contracts/openapi.json. Do not edit.
type Validator = ((data: unknown) => boolean) & {
  errors?: readonly { instancePath?: string; message?: string }[] | null;
};
export const authenticationContextInput: Validator;
export const authenticationContextOutput: Validator;
export const authenticationContextOutputFull: Validator;
