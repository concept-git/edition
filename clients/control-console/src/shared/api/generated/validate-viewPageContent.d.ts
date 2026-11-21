// Generated from contracts/openapi.json. Do not edit.
type Validator = ((data: unknown) => boolean) & {
  errors?: readonly { instancePath?: string; message?: string }[] | null;
};
export const viewPageContentInput: Validator;
export const viewPageContentOutput: Validator;
export const viewPageContentOutputFull: Validator;
