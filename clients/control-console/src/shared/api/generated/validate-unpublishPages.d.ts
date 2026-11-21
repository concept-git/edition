// Generated from contracts/openapi.json. Do not edit.
type Validator = ((data: unknown) => boolean) & {
  errors?: readonly { instancePath?: string; message?: string }[] | null;
};
export const unpublishPagesInput: Validator;
export const unpublishPagesOutput: Validator;
export const unpublishPagesOutputFull: Validator;
