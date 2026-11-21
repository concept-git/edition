// Generated from contracts/openapi.json. Do not edit.
type Validator = ((data: unknown) => boolean) & {
  errors?: readonly { instancePath?: string; message?: string }[] | null;
};
export const remountSpaceByIdInput: Validator;
export const remountSpaceByIdOutput: Validator;
export const remountSpaceByIdOutputFull: Validator;
