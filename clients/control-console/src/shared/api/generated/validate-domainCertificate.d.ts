// Generated from contracts/openapi.json. Do not edit.
type Validator = ((data: unknown) => boolean) & {
  errors?: readonly { instancePath?: string; message?: string }[] | null;
};
export const domainCertificateInput: Validator;
export const domainCertificateOutput: Validator;
export const domainCertificateOutputFull: Validator;
