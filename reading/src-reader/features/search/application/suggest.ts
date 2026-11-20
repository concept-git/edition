import type {
  SearchTracker,
  SuggestGateway,
  SuggestHit,
} from "../domain/suggest.ts";
import {
  allResultsHref,
  isSearchable,
  isTooLong,
  safeHits,
} from "../domain/suggest.ts";

export type SuggestPhase =
  "closed" | "loading" | "results" | "empty" | "failed" | "too-long";

export interface SuggestState {
  phase: SuggestPhase;
  /** 每次重新搜索递增；用作选项 id 的一部分。 */
  generation: number;
  query: string;
  scope: string;
  hits: SuggestHit[];
  proof: string | null;
  allHref: string | null;
  failure: { status: number; traceId: string | null } | null;
  /** 失败后「重试」是否可用（服务端要求等待时先禁用）。 */
  retryEnabled: boolean;
  /** 键盘选中的选项下标，-1 为无。 */
  active: number;
}

export interface Scheduler {
  set(run: () => void, ms: number): unknown;
  clear(handle: unknown): void;
}

const defaultScheduler: Scheduler = {
  set: (run, ms) => setTimeout(run, ms),
  clear: (handle) => clearTimeout(handle as ReturnType<typeof setTimeout>),
};

const closedState = (generation: number): SuggestState => ({
  phase: "closed",
  generation,
  query: "",
  scope: "",
  hits: [],
  proof: null,
  allHref: null,
  failure: null,
  retryEnabled: true,
  active: -1,
});

/** 即时搜索的交互状态机：防抖、取消过期请求、输入法组合、键盘选择与失败重试。 */
export function createSuggest(options: {
  gateway: SuggestGateway;
  tracker: SearchTracker;
  onChange: (state: SuggestState) => void;
  scheduler?: Scheduler;
  debounceMs?: number;
}) {
  const scheduler = options.scheduler ?? defaultScheduler;
  const debounce = options.debounceMs ?? 200;
  let state = closedState(0);
  let epoch = 0;
  let timer: unknown;
  let retryTimer: unknown;
  let abort: AbortController | undefined;
  let composing = false;
  let input = { value: "", scope: "" };

  const set = (patch: Partial<SuggestState>) => {
    state = { ...state, ...patch };
    options.onChange(state);
  };
  const cancel = () => {
    epoch++;
    scheduler.clear(timer);
    scheduler.clear(retryTimer);
    abort?.abort();
    abort = undefined;
  };
  const hide = () => {
    cancel();
    set({ ...closedState(epoch) });
  };
  const optionCount = () =>
    state.phase === "results"
      ? state.hits.length + 1
      : state.phase === "failed"
        ? 1
        : 0;

  async function run() {
    const query = input.value.trim();
    const scope = input.scope;
    if (isTooLong(query)) {
      set({ ...closedState(epoch), phase: "too-long", query });
      return;
    }
    cancel();
    const mine = epoch;
    abort = new AbortController();
    set({ ...closedState(mine), phase: "loading", query, scope });
    let outcome;
    try {
      outcome = await options.gateway.suggest(
        { q: query, spaceSlug: scope || null },
        abort.signal,
      );
    } catch {
      if (mine !== epoch) return;
      outcome = {
        kind: "failed" as const,
        status: 0,
        traceId: null,
        retryAfter: null,
      };
    }
    if (mine !== epoch || composing || input.value.trim() !== query) return;
    if (outcome.kind === "failed") {
      const wait = outcome.retryAfter ?? 0;
      if (wait > 0)
        retryTimer = scheduler.set(
          () => set({ retryEnabled: true }),
          Math.min(3600, wait) * 1000,
        );
      set({
        phase: "failed",
        failure: { status: outcome.status, traceId: outcome.traceId },
        retryEnabled: wait <= 0,
      });
      return;
    }
    const hits = safeHits(outcome.hits);
    set(
      hits.length === 0
        ? { phase: "empty" }
        : {
            phase: "results",
            hits,
            proof: outcome.trackingToken,
            allHref: allResultsHref(query, scope || null),
          },
    );
  }

  const schedule = () => {
    hide();
    if (!composing && isSearchable(input.value.trim()))
      timer = scheduler.set(() => void run(), debounce);
  };

  return {
    state: () => state,
    optionCount,
    /** 输入或范围变化。 */
    input(value: string, scope: string) {
      input = { value, scope };
      schedule();
    },
    compositionStart() {
      composing = true;
      hide();
    },
    compositionEnd(value: string, scope: string) {
      composing = false;
      input = { value, scope };
      schedule();
    },
    hide,
    /** 表单提交（Enter 走 /_search）：只取消在途请求。 */
    submit() {
      cancel();
    },
    isComposing: () => composing,
    next() {
      const count = optionCount();
      if (count) set({ active: (state.active + 1) % count });
    },
    previous() {
      const count = optionCount();
      if (count)
        set({ active: state.active <= 0 ? count - 1 : state.active - 1 });
    },
    retry() {
      if (state.phase !== "failed" || !state.retryEnabled) return;
      void run();
    },
    /** 点击建议：上报点击观测。 */
    choose(hit: SuggestHit) {
      if (state.proof) options.tracker.track("click", state.proof, hit.path);
    },
  };
}
