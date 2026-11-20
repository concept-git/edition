import type { RenewResult } from "../domain/session.ts";
import { safeReturnTo } from "../domain/session.ts";

export type ResumeOutcome =
  | { kind: "continue"; to: string }
  | { kind: "login"; to: string }
  | {
      kind: "wait";
      reason: "offline" | "unavailable";
      retryAfter: number | null;
    };

/** 「继续阅读」：续期成功回原页；续期被拒去登录；其余保留会话并提示稍后重试。 */
export async function resumeReading(
  renewer: { renew(): Promise<RenewResult> },
  returnTo: unknown,
): Promise<ResumeOutcome> {
  const to = safeReturnTo(returnTo);
  const result = await renewer.renew();
  if (result.status === 204) return { kind: "continue", to };
  if (result.status === 401)
    return { kind: "login", to: `/_login?returnTo=${encodeURIComponent(to)}` };
  return {
    kind: "wait",
    reason: result.status === 0 ? "offline" : "unavailable",
    retryAfter: result.retryAfter,
  };
}
