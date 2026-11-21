// Generated from contracts/openapi.json. Do not edit.
type Validator = ((data: unknown) => boolean) & {
  errors?: readonly { instancePath?: string; message?: string }[] | null;
};
export const unmountSpaceByIdInput: Validator;
export const unmountSpaceByIdOutput: Validator;
export const unmountSpaceByIdOutputFull: Validator;
