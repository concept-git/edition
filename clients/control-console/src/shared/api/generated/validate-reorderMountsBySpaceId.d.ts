// Generated from contracts/openapi.json. Do not edit.
type Validator = ((data: unknown) => boolean) & {
  errors?: readonly { instancePath?: string; message?: string }[] | null;
};
export const reorderMountsBySpaceIdInput: Validator;
export const reorderMountsBySpaceIdOutput: Validator;
export const reorderMountsBySpaceIdOutputFull: Validator;
