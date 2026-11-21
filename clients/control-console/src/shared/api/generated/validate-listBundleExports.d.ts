// Generated from contracts/openapi.json. Do not edit.
type Validator = ((data: unknown) => boolean) & {
  errors?: readonly { instancePath?: string; message?: string }[] | null;
};
export const listBundleExportsInput: Validator;
export const listBundleExportsOutput: Validator;
export const listBundleExportsOutputFull: Validator;
