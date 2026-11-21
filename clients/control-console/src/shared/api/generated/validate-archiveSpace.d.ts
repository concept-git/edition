// Generated from contracts/openapi.json. Do not edit.
type Validator = ((data: unknown) => boolean) & {
  errors?: readonly { instancePath?: string; message?: string }[] | null;
};
export const archiveSpaceInput: Validator;
export const archiveSpaceOutput: Validator;
export const archiveSpaceOutputFull: Validator;
