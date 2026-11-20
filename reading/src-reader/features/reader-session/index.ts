// reader-session 的公开契约。
export type {
  Credentials,
  OpenFailure,
  OpenResult,
  RenewResult,
  Send,
  SessionGateway,
  UpstreamOutcome,
  UpstreamSessionGateway,
} from "./domain/session.ts";
export {
  isSameSiteWrite,
  parseReturnTo,
  safeReturnTo,
} from "./domain/session.ts";
export type { SignInResult } from "./application/sign-in.ts";
export { signIn, signOut } from "./application/sign-in.ts";
export type { FormSessionResult } from "./application/form-session.ts";
export {
  submitLogin,
  submitLogout,
} from "./application/form-session.ts";
export type { Lock, Renewer } from "./application/renewal.ts";
export { createRenewer } from "./application/renewal.ts";
export { withRenewal } from "./application/authed-send.ts";
export type { ResumeOutcome } from "./application/resume-reading.ts";
export { resumeReading } from "./application/resume-reading.ts";
