import type {
  Credentials,
  OpenFailure,
  SessionGateway,
} from "../domain/session.ts";
import { safeReturnTo } from "../domain/session.ts";

export type SignInResult =
  | { ok: true; redirectTo: string }
  | { ok: false; reason: OpenFailure; retryAfter: number | null };

/** 登录用例：成功后给出站内跳转地址，失败给出可展示的原因。 */
export async function signIn(
  gateway: SessionGateway,
  credentials: Credentials,
  returnTo: unknown,
): Promise<SignInResult> {
  const email = credentials.email.trim();
  if (!email || !credentials.password)
    return { ok: false, reason: "invalid-input", retryAfter: null };
  const result = await gateway.open({ email, password: credentials.password });
  return result.ok ? { ok: true, redirectTo: safeReturnTo(returnTo) } : result;
}

/** 退出：幂等；失败不抛出，会话 Cookie 过期后自然失效。 */
export async function signOut(gateway: SessionGateway): Promise<void> {
  try {
    await gateway.close();
  } catch {
    // 退出是尽力而为。
  }
}
