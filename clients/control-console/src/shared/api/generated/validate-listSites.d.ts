// Generated from contracts/openapi.json. Do not edit.
type Validator = ((data: unknown) => boolean) & {
  errors?: readonly { instancePath?: string; message?: string }[] | null;
};
export const listSitesInput: Validator;
export const listSitesOutput: Validator;
export const listSitesOutputFull: Validator;
