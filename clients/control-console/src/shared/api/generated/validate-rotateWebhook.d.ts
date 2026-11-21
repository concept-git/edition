// Generated from contracts/openapi.json. Do not edit.
type Validator = ((data: unknown) => boolean) & {
  errors?: readonly { instancePath?: string; message?: string }[] | null;
};
export const rotateWebhookInput: Validator;
export const rotateWebhookOutput: Validator;
export const rotateWebhookOutputFull: Validator;
