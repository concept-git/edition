// Generated from contracts/openapi.json. Do not edit.
type Validator = ((data: unknown) => boolean) & {
  errors?: readonly { instancePath?: string; message?: string }[] | null;
};
export const operationsCapabilitiesInput: Validator;
export const operationsCapabilitiesOutput: Validator;
export const operationsCapabilitiesOutputFull: Validator;
