// Generated from contracts/openapi.json. Do not edit.
type Validator = ((data: unknown) => boolean) & {
  errors?: readonly { instancePath?: string; message?: string }[] | null;
};
export const putSpaceGrantInput: Validator;
export const putSpaceGrantOutput: Validator;
export const putSpaceGrantOutputFull: Validator;
