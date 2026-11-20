import { test } from "node:test";
import assert from "node:assert/strict";
import {
  createSuggest,
  snippetSegments,
  suggestMessages,
} from "../src-reader/features/search/index.ts";
import {
  allResultsHref,
  isSearchable,
  isTooLong,
} from "../src-reader/features/search/domain/suggest.ts";
import {
  createBrowserSuggestGateway,
  createBrowserTracker,
} from "../src-reader/features/search/data/browser-suggest-gateway.ts";
import { createReaderSearchRepository } from "../src-reader/features/search/data/reader-search-repository.ts";
import { buildForwardContext } from "../src-reader/shared/http/forward.ts";
import { createReaderClient } from "../src-reader/shared/http/reader-client.ts";

const hit = (path, title = "T") => ({
  path,
  title,
  spaceName: "S",
  snippet: "",
});

/** 手动推进的调度器。 */
function manualScheduler() {
  const tasks = new Map();
  let id = 0;
  return {
    scheduler: {
      set: (run, ms) => (tasks.set(++id, { run, ms }), id),
      clear: (handle) => tasks.delete(handle),
    },
    pending: () => [...tasks.values()],
    fire() {
      const [[key, task]] = [...tasks];
      tasks.delete(key);
      task.run();
      return task.ms;
    },
  };
}

function harness(suggest) {
  const clock = manualScheduler();
  const states = [];
  const tracked = [];
  const requests = [];
  const controller = createSuggest({
    gateway: {
      suggest: (request, signal) => (
        requests.push({ request, signal }),
        suggest(request, signal)
      ),
    },
    tracker: { track: (...args) => tracked.push(args) },
    onChange: (state) => states.push(state),
    scheduler: clock.scheduler,
  });
  return { controller, clock, states, tracked, requests };
}
const settle = () => new Promise((resolve) => setImmediate(resolve));

test("snippetSegments：只保留 mark，实体还原，丢弃其它标签", () => {
  assert.deepEqual(
    snippetSegments(
      "a <mark>b</mark> <script>x</script>&lt;i&gt; &amp;&quot;&#39;",
    ),
    [
      { text: "a ", mark: false },
      { text: "b", mark: true },
      { text: " ", mark: false },
      { text: "x", mark: false },
      { text: "<i> &\"'", mark: false },
    ],
  );
  assert.deepEqual(snippetSegments("<MARK class='k'>z</mark >"), [
    { text: "z", mark: true },
  ]);
  assert.deepEqual(snippetSegments(""), []);
});

test("domain：长度判断、全部结果链接与文案", () => {
  assert.equal(isSearchable("检"), false);
  assert.equal(isSearchable("检索"), true);
  assert.equal(isTooLong("a".repeat(200)), false);
  assert.equal(isTooLong("a".repeat(201)), true);
  assert.equal(allResultsHref("a b", null), "/_search?q=a+b");
  assert.equal(allResultsHref("a", "docs"), "/_search?q=a&spaceSlug=docs");
  assert.equal(suggestMessages(true).retry, "重试搜索");
  assert.equal(suggestMessages(true).results(3), "显示 3 条推荐结果");
  assert.equal(suggestMessages(false).results(3), "3 suggested results");
});

test("防抖后搜索，结果过滤站外链接并给出全部结果入口", async () => {
  const h = harness(async () => ({
    kind: "results",
    hits: [hit("/docs/a"), hit("https://evil.test/x")],
    trackingToken: "proof",
  }));
  h.controller.input("检", "docs");
  assert.equal(h.clock.pending().length, 0);
  h.controller.input("检索", "docs");
  assert.equal(h.clock.fire(), 200);
  assert.equal(h.controller.state().phase, "loading");
  await settle();
  const state = h.controller.state();
  assert.equal(state.phase, "results");
  assert.equal(state.hits.length, 1);
  assert.equal(state.allHref, "/_search?q=%E6%A3%80%E7%B4%A2&spaceSlug=docs");
  assert.deepEqual(h.requests[0].request, { q: "检索", spaceSlug: "docs" });
  assert.equal(h.controller.optionCount(), 2);
  h.controller.choose(state.hits[0]);
  assert.deepEqual(h.tracked, [["click", "proof", "/docs/a"]]);
});

test("没有观测凭据时点击不上报；全站范围不带 spaceSlug", async () => {
  const h = harness(async () => ({
    kind: "results",
    hits: [hit("/a")],
    trackingToken: null,
  }));
  h.controller.input("检索", "");
  h.clock.fire();
  await settle();
  h.controller.choose(h.controller.state().hits[0]);
  assert.deepEqual(h.tracked, []);
  assert.equal(h.requests[0].request.spaceSlug, null);
});

test("空结果；过长不请求；清空则关闭并作废迟到结果", async () => {
  const empty = harness(async () => ({
    kind: "results",
    hits: [],
    trackingToken: null,
  }));
  empty.controller.input("检索", "");
  empty.clock.fire();
  await settle();
  assert.equal(empty.controller.state().phase, "empty");
  assert.equal(empty.controller.optionCount(), 0);

  const long = harness(async () => assert.fail("不应请求"));
  long.controller.input("a".repeat(201), "");
  long.clock.fire();
  assert.equal(long.controller.state().phase, "too-long");

  let release;
  const gate = new Promise((resolve) => (release = resolve));
  const late = harness(async () => {
    await gate;
    return { kind: "results", hits: [hit("/a")], trackingToken: null };
  });
  late.controller.input("中文", "");
  late.clock.fire();
  late.controller.input("", "");
  assert.equal(late.requests[0].signal.aborted, true);
  release();
  await settle();
  assert.equal(late.controller.state().phase, "closed");
});

test("输入变化使在途请求过期；输入法组合期间不搜索，结束后再搜", async () => {
  let n = 0;
  const h = harness(async () => ({
    kind: "results",
    hits: [hit(`/p${++n}`)],
    trackingToken: null,
  }));
  h.controller.input("检索", "");
  h.clock.fire();
  h.controller.input("检索2", "");
  await settle();
  assert.equal(h.controller.state().phase, "closed");

  h.controller.compositionStart();
  assert.equal(h.controller.isComposing(), true);
  h.controller.input("中文", "");
  assert.equal(h.clock.pending().length, 0);
  assert.equal(h.controller.state().phase, "closed");
  h.controller.compositionEnd("中文", "");
  assert.equal(h.clock.pending().length, 1);
  h.clock.fire();
  await settle();
  assert.equal(h.controller.state().phase, "results");
  h.controller.compositionStart();
  h.controller.compositionEnd("中", "");
  assert.equal(h.clock.pending().length, 0);
});

test("组合开始时丢弃在途结果", async () => {
  let release;
  const gate = new Promise((resolve) => (release = resolve));
  const h = harness(async () => {
    await gate;
    return { kind: "results", hits: [hit("/a")], trackingToken: null };
  });
  h.controller.input("检索", "");
  h.clock.fire();
  h.controller.compositionStart();
  release();
  await settle();
  assert.equal(h.controller.state().phase, "closed");
});

test("失败：显示 traceId；Retry-After 期间重试禁用，到点启用后可重试", async () => {
  let attempt = 0;
  const h = harness(async () =>
    attempt++ === 0
      ? { kind: "failed", status: 429, traceId: "tr", retryAfter: 2 }
      : { kind: "results", hits: [hit("/a")], trackingToken: null },
  );
  h.controller.input("检索", "");
  h.clock.fire();
  await settle();
  let state = h.controller.state();
  assert.equal(state.phase, "failed");
  assert.equal(state.failure.traceId, "tr");
  assert.equal(state.retryEnabled, false);
  assert.equal(h.controller.optionCount(), 1);
  h.controller.retry();
  assert.equal(h.requests.length, 1);
  assert.equal(h.clock.fire(), 2000);
  assert.equal(h.controller.state().retryEnabled, true);
  h.controller.retry();
  await settle();
  assert.equal(h.controller.state().phase, "results");
  assert.equal(h.requests.length, 2);
  h.controller.retry();
  assert.equal(h.requests.length, 2);
});

test("网关抛错按不可用处理且可立即重试；被取消的抛错忽略", async () => {
  let attempt = 0;
  const h = harness(async () => {
    if (attempt++ < 2) throw new TypeError("offline");
    return { kind: "results", hits: [hit("/a")], trackingToken: null };
  });
  h.controller.input("检索", "");
  h.clock.fire();
  await settle();
  assert.equal(h.controller.state().phase, "failed");
  assert.equal(h.controller.state().failure.status, 0);
  assert.equal(h.controller.state().retryEnabled, true);
  h.controller.retry();
  h.controller.hide();
  await settle();
  assert.equal(h.controller.state().phase, "closed");
  h.controller.input("检索", "");
  h.clock.fire();
  await settle();
  assert.equal(h.controller.state().phase, "results");
});

test("键盘：向下循环、向上从头回到末尾；无选项时无动作；提交只取消", async () => {
  const h = harness(async () => ({
    kind: "results",
    hits: [hit("/a"), hit("/b")],
    trackingToken: null,
  }));
  h.controller.next();
  h.controller.previous();
  assert.equal(h.controller.state().active, -1);
  h.controller.input("检索", "");
  h.clock.fire();
  await settle();
  h.controller.next();
  assert.equal(h.controller.state().active, 0);
  h.controller.next();
  h.controller.next();
  h.controller.next();
  assert.equal(h.controller.state().active, 0);
  h.controller.previous();
  assert.equal(h.controller.state().active, 2);
  h.controller.previous();
  assert.equal(h.controller.state().active, 1);
  h.controller.submit();
  h.controller.hide();
  assert.equal(h.controller.state().active, -1);
});

function browser(respond) {
  const calls = [];
  const send = async (url, init) => (
    calls.push({ url: String(url), init }),
    respond(String(url))
  );
  return { calls, gateway: createBrowserSuggestGateway(send), send };
}
const json = (body, status = 200, headers = {}) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json", ...headers },
  });
const signal = new AbortController().signal;

test("浏览器网关：全站搜索与结果映射", async () => {
  const b = browser(() =>
    json({
      trackingToken: "t",
      hits: [{ path: "/a", title: "A", spaceName: "S", snippet: "x" }, null],
    }),
  );
  const outcome = await b.gateway.suggest(
    { q: "检索", spaceSlug: null },
    signal,
  );
  const url = new URL(b.calls[0].url, "http://x");
  assert.equal(url.pathname, "/api/content/search");
  assert.equal(url.searchParams.get("limit"), "8");
  assert.equal(url.searchParams.has("spaceSlug"), false);
  assert.equal(outcome.trackingToken, "t");
  assert.equal(outcome.hits.length, 2);
  assert.equal(outcome.hits[1].path, "");
  assert.equal(b.calls[0].init.credentials, "same-origin");
});

test("浏览器网关：范围搜索先取快照并缓存；切版丢弃缓存", async () => {
  let search = 0;
  const b = browser((url) => {
    if (url.includes("/snapshot")) return json({ snapshot: "snap-1" });
    return ++search === 2 ? json({ code: "x" }, 409) : json({ hits: [] });
  });
  await b.gateway.suggest({ q: "ab", spaceSlug: "docs" }, signal);
  assert.equal(b.calls[0].url, "/api/content/spaces/docs/snapshot");
  const params = new URL(b.calls[1].url, "http://x").searchParams;
  assert.equal(params.get("spaceSlug"), "docs");
  assert.equal(params.get("snapshot"), "snap-1");
  const changed = await b.gateway.suggest(
    { q: "ab", spaceSlug: "docs" },
    signal,
  );
  assert.equal(b.calls.length, 3);
  assert.equal(changed.kind, "failed");
  assert.equal(changed.status, 409);
  await b.gateway.suggest({ q: "ab", spaceSlug: "docs" }, signal);
  assert.equal(b.calls.length, 5);
});

test("浏览器网关：快照或搜索失败带 traceId 与 Retry-After；响应形状错误抛出", async () => {
  const failed = browser(() =>
    json({ traceId: "tr" }, 503, { "retry-after": "3" }),
  );
  assert.deepEqual(
    await failed.gateway.suggest({ q: "ab", spaceSlug: "docs" }, signal),
    { kind: "failed", status: 503, traceId: "tr", retryAfter: 3 },
  );
  assert.deepEqual(
    await failed.gateway.suggest({ q: "ab", spaceSlug: null }, signal),
    { kind: "failed", status: 503, traceId: "tr", retryAfter: 3 },
  );
  const bad = browser(() => json({ hits: "no" }));
  await assert.rejects(
    bad.gateway.suggest({ q: "ab", spaceSlug: null }, signal),
  );
});

test("浏览器观测：带凭据 POST search-events，失败不抛出，无凭据不发送", async () => {
  const calls = [];
  const tracker = createBrowserTracker(async (url, init) => {
    calls.push({ url, init });
    throw new TypeError("offline");
  });
  tracker.track("click", "proof", "/a");
  tracker.track("observable", "", null);
  await settle();
  assert.equal(calls.length, 1);
  assert.equal(calls[0].url, "/api/content/search-events");
  assert.deepEqual(JSON.parse(calls[0].init.body), {
    kind: "click",
    proof: "proof",
    path: "/a",
  });
  assert.equal(calls[0].init.keepalive, true);
});

test("服务端搜索仓储：范围搜索带快照，缺失空间透传失败，响应带观测凭据", async () => {
  const seen = [];
  const respond = (url) => {
    seen.push(url);
    if (url.includes("/spaces/"))
      return url.includes("nope") ? json({}, 404) : json({ snapshot: "sn" });
    return json({ query: "q", hits: [], trackingToken: "tok", nextCursor: "" });
  };
  const client = createReaderClient({
    origin: "http://reader",
    fetch: async (url) => respond(String(url)),
  });
  const context = buildForwardContext(
    new Headers({ host: "d.test" }),
    new URL("http://d.test/"),
  );
  const repository = createReaderSearchRepository(client, context);
  const ok = await repository.search({ q: "q", spaceSlug: "do cs" });
  assert.equal(seen[0], "http://reader/api/content/spaces/do%20cs/snapshot");
  const params = new URL(seen[1]).searchParams;
  assert.equal(params.get("spaceSlug"), "do cs");
  assert.equal(params.get("snapshot"), "sn");
  assert.equal(ok.trackingToken, "tok");
  assert.equal(ok.nextCursor, null);
  const missing = await repository.search({ q: "q", spaceSlug: "nope" });
  assert.equal(missing.kind, "missing");
});
