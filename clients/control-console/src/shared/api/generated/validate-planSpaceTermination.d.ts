// Generated from contracts/openapi.json. Do not edit.
type Validator = ((data: unknown) => boolean) & {
  errors?: readonly { instancePath?: string; message?: string }[] | null;
};
export const planSpaceTerminationInput: Validator;
export const planSpaceTerminationOutput: Validator;
export const planSpaceTerminationOutputFull: Validator;
