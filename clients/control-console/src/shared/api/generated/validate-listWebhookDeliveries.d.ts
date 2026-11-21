// Generated from contracts/openapi.json. Do not edit.
type Validator = ((data: unknown) => boolean) & {
  errors?: readonly { instancePath?: string; message?: string }[] | null;
};
export const listWebhookDeliveriesInput: Validator;
export const listWebhookDeliveriesOutput: Validator;
export const listWebhookDeliveriesOutputFull: Validator;
