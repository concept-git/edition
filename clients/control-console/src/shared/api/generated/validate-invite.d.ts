// Generated from contracts/openapi.json. Do not edit.
type Validator = ((data: unknown) => boolean) & {
  errors?: readonly { instancePath?: string; message?: string }[] | null;
};
export const inviteInput: Validator;
export const inviteOutput: Validator;
export const inviteOutputFull: Validator;
