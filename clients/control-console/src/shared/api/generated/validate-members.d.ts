// Generated from contracts/openapi.json. Do not edit.
type Validator = ((data: unknown) => boolean) & {
  errors?: readonly { instancePath?: string; message?: string }[] | null;
};
export const membersInput: Validator;
export const membersOutput: Validator;
export const membersOutputFull: Validator;
