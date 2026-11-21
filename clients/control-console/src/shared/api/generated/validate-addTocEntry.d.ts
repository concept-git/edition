// Generated from contracts/openapi.json. Do not edit.
type Validator = ((data: unknown) => boolean) & {
  errors?: readonly { instancePath?: string; message?: string }[] | null;
};
export const addTocEntryInput: Validator;
export const addTocEntryOutput: Validator;
export const addTocEntryOutputFull: Validator;
