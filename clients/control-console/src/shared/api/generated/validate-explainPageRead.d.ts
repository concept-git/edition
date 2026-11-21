// Generated from contracts/openapi.json. Do not edit.
type Validator = ((data: unknown) => boolean) & {
  errors?: readonly { instancePath?: string; message?: string }[] | null;
};
export const explainPageReadInput: Validator;
export const explainPageReadOutput: Validator;
export const explainPageReadOutputFull: Validator;
