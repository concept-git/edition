// Generated from contracts/openapi.json. Do not edit.
type Validator = ((data: unknown) => boolean) & {
  errors?: readonly { instancePath?: string; message?: string }[] | null;
};
export const siteDeliveryStatusInput: Validator;
export const siteDeliveryStatusOutput: Validator;
export const siteDeliveryStatusOutputFull: Validator;
