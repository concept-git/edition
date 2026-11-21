// Generated from contracts/openapi.json. Do not edit.
type Validator = ((data: unknown) => boolean) & {
  errors?: readonly { instancePath?: string; message?: string }[] | null;
};
export const viewPageRevisionInput: Validator;
export const viewPageRevisionOutput: Validator;
export const viewPageRevisionOutputFull: Validator;
