import type { RenewResult, SessionGateway } from "../domain/session.ts";

export type Lock = <T>(run: () => Promise<T>) => Promise<T>;

export interface Renewer {
  /** 续期：同页并发合并，跨标签经锁串行，限流期内不再打扰 Control。 */
  renew(): Promise<RenewResult>;
  /** 限流冷却剩余秒数。 */
  cooldownSeconds(): number;
}

const maxCooldownSeconds = 3600;

export function createRenewer(options: {
  gateway: Pick<SessionGateway, "renew">;
  lock?: Lock;
  now?: () => number;
}): Renewer {
  const now = options.now ?? Date.now;
  const lock: Lock = options.lock ?? ((run) => run());
  let pending: Promise<RenewResult> | null = null;
  let retryAt = 0;
  const cooldownSeconds = () =>
    Math.max(0, Math.ceil((retryAt - now()) / 1000));
  return {
    cooldownSeconds,
    renew() {
      if (pending) return pending;
      const wait = cooldownSeconds();
      if (wait > 0)
        return Promise.resolve({
          status: 429,
          retryAfter: wait,
          requestId: null,
        });
      pending = lock(async () => {
        const result = await options.gateway.renew();
        if (result.status === 429 || result.status === 503) {
          const seconds = Math.min(maxCooldownSeconds, result.retryAfter ?? 1);
          retryAt = Math.max(retryAt, now() + seconds * 1000);
        }
        return result;
      }).finally(() => {
        pending = null;
      });
      return pending;
    },
  };
}
