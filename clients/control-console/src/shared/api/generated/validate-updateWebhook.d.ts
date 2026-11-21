// Generated from contracts/openapi.json. Do not edit.
type Validator = ((data: unknown) => boolean) & {
  errors?: readonly { instancePath?: string; message?: string }[] | null;
};
export const updateWebhookInput: Validator;
export const updateWebhookOutput: Validator;
export const updateWebhookOutputFull: Validator;
