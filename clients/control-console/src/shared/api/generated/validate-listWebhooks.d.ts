// Generated from contracts/openapi.json. Do not edit.
type Validator = ((data: unknown) => boolean) & {
  errors?: readonly { instancePath?: string; message?: string }[] | null;
};
export const listWebhooksInput: Validator;
export const listWebhooksOutput: Validator;
export const listWebhooksOutputFull: Validator;
