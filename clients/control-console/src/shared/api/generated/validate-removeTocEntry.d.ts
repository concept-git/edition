// Generated from contracts/openapi.json. Do not edit.
type Validator = ((data: unknown) => boolean) & {
  errors?: readonly { instancePath?: string; message?: string }[] | null;
};
export const removeTocEntryInput: Validator;
export const removeTocEntryOutput: Validator;
export const removeTocEntryOutputFull: Validator;
