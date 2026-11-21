// Generated from contracts/openapi.json. Do not edit.
type Validator = ((data: unknown) => boolean) & {
  errors?: readonly { instancePath?: string; message?: string }[] | null;
};
export const relabelTocEntryInput: Validator;
export const relabelTocEntryOutput: Validator;
export const relabelTocEntryOutputFull: Validator;
