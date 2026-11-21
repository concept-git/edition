// Generated from contracts/openapi.json. Do not edit.
type Validator = ((data: unknown) => boolean) & {
  errors?: readonly { instancePath?: string; message?: string }[] | null;
};
export const unpublishPageInput: Validator;
export const unpublishPageOutput: Validator;
export const unpublishPageOutputFull: Validator;
