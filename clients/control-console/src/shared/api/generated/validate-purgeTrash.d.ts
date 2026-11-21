// Generated from contracts/openapi.json. Do not edit.
type Validator = ((data: unknown) => boolean) & {
  errors?: readonly { instancePath?: string; message?: string }[] | null;
};
export const purgeTrashInput: Validator;
export const purgeTrashOutput: Validator;
export const purgeTrashOutputFull: Validator;
