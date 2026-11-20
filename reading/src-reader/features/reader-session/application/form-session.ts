import type {
  Credentials,
  UpstreamOutcome,
  UpstreamSessionGateway,
} from "../domain/session.ts";
import { parseReturnTo } from "../domain/session.ts";

export type FormSessionResult =
  | { kind: "done"; redirectTo: string; setCookies: string[] }
  | { kind: "invalid-return-to" }
  | { kind: "invalid-input" }
  | (Extract<UpstreamOutcome, { ok: false }> & { kind: "failed" });

function failed(outcome: Extract<UpstreamOutcome, { ok: false }>) {
  return { kind: "failed" as const, ...outcome };
}

/** 无脚本登录：先校验 returnTo 与输入，再代调 Control；成功带回原样 Set-Cookie。 */
export async function submitLogin(
  gateway: UpstreamSessionGateway,
  form: Partial<Record<keyof Credentials | "returnTo", unknown>>,
): Promise<FormSessionResult> {
  const redirectTo = parseReturnTo(form.returnTo);
  if (redirectTo === null) return { kind: "invalid-return-to" };
  const email = typeof form.email === "string" ? form.email.trim() : "";
  const password = typeof form.password === "string" ? form.password : "";
  if (!email || !password) return { kind: "invalid-input" };
  const outcome = await gateway.open({ email, password });
  return outcome.ok
    ? { kind: "done", redirectTo, setCookies: outcome.setCookies }
    : failed(outcome);
}

/** 无脚本退出：成功后转发清除 Cookie，回登录页。 */
export async function submitLogout(
  gateway: UpstreamSessionGateway,
  loginPath = "/_login",
): Promise<FormSessionResult> {
  const outcome = await gateway.close();
  return outcome.ok
    ? { kind: "done", redirectTo: loginPath, setCookies: outcome.setCookies }
    : failed(outcome);
}
