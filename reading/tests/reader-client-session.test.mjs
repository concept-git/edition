import { test } from "node:test";
import assert from "node:assert/strict";
import {
  createRenewer,
  resumeReading,
  withRenewal,
} from "../src-reader/features/reader-session/index.ts";

const result = (status, retryAfter = null, requestId = null) => ({
  status,
  retryAfter,
  requestId,
});
const clock = () => {
  const state = { now: 1_000_000 };
  return { state, now: () => state.now };
};
const problemResponse = (status, code, headers = {}) =>
  new Response(JSON.stringify({ code }), {
    status,
    headers: { "content-type": "application/problem+json", ...headers },
  });

test("renewer：并发合并为一次续期，并经锁串行", async () => {
  let calls = 0;
  let locked = 0;
  const renewer = createRenewer({
    gateway: { renew: async () => (calls++, result(204)) },
    lock: async (run) => (locked++, run()),
  });
  const [a, b] = await Promise.all([renewer.renew(), renewer.renew()]);
  assert.equal(a.status, 204);
  assert.equal(b, a);
  assert.equal(calls, 1);
  assert.equal(locked, 1);
  await renewer.renew();
  assert.equal(calls, 2);
});

test("renewer：429/503 进入冷却，期间不再请求，冷却后恢复", async () => {
  const { state, now } = clock();
  const answers = [result(429, 2, "r1"), result(503, null), result(204)];
  let calls = 0;
  const renewer = createRenewer({
    gateway: { renew: async () => answers[calls++] },
    now,
  });
  assert.equal(renewer.cooldownSeconds(), 0);
  assert.equal((await renewer.renew()).requestId, "r1");
  assert.equal(renewer.cooldownSeconds(), 2);
  const blocked = await renewer.renew();
  assert.deepEqual(blocked, result(429, 2));
  assert.equal(calls, 1);
  state.now += 2001;
  assert.equal(renewer.cooldownSeconds(), 0);
  assert.equal((await renewer.renew()).status, 503);
  assert.equal(renewer.cooldownSeconds(), 1);
  state.now += 1000;
  assert.equal((await renewer.renew()).status, 204);
  assert.equal(calls, 3);
});

test("renewer：Retry-After 上限一小时；失败不留 pending", async () => {
  const { now } = clock();
  let calls = 0;
  const renewer = createRenewer({
    gateway: {
      renew: async () => {
        if (calls++ === 0) throw new Error("boom");
        return result(429, 999999);
      },
    },
    now,
  });
  await assert.rejects(renewer.renew());
  assert.equal((await renewer.renew()).status, 429);
  assert.equal(renewer.cooldownSeconds(), 3600);
});

test("withRenewal：凭据过期则续期后重试一次", async () => {
  const seen = [];
  const send = async (input) => {
    seen.push(input);
    return seen.length === 1
      ? problemResponse(401, "reader_access_expired")
      : new Response("ok");
  };
  const wrapped = withRenewal(send, { renew: async () => result(204) }, () => {
    throw new Error("no login");
  });
  assert.equal(await (await wrapped("/x")).text(), "ok");
  assert.equal(seen.length, 2);
});

test("withRenewal：非 401、非 GET、其它 401 原样返回，不续期", async () => {
  let renewed = 0;
  const renewer = { renew: async () => (renewed++, result(204)) };
  const wrap = (response) =>
    withRenewal(
      async () => response,
      renewer,
      () => {},
    );
  assert.equal((await wrap(new Response("x"))("/x")).status, 200);
  const expired = () => problemResponse(401, "reader_access_expired");
  assert.equal((await wrap(expired())("/x", { method: "POST" })).status, 401);
  assert.equal(
    (await wrap(problemResponse(401, "invalid_token"))("/x")).status,
    401,
  );
  const notJson = new Response("<html>", { status: 401 });
  assert.equal((await wrap(notJson)("/x")).status, 401);
  assert.equal(renewed, 0);
});

test("withRenewal：续期被拒要求登录；其余失败合成 problem 并带 Retry-After", async () => {
  let login = 0;
  const base = async () => problemResponse(401, "reader_access_expired");
  const rejected = withRenewal(
    base,
    { renew: async () => result(401) },
    () => login++,
  );
  assert.equal((await rejected("/x")).status, 401);
  assert.equal(login, 1);

  const limited = withRenewal(
    base,
    { renew: async () => result(429, 2, "rid") },
    () => {},
  );
  const response = await limited("/x");
  assert.equal(response.status, 429);
  assert.equal(response.headers.get("retry-after"), "2");
  assert.deepEqual(await response.json(), {
    code: "reader_refresh_unavailable",
    traceId: "rid",
  });

  const offline = await withRenewal(
    base,
    { renew: async () => result(0) },
    () => {},
  )("/x");
  assert.equal(offline.status, 503);
  assert.equal(offline.headers.get("retry-after"), "1");
});

test("resumeReading：成功回原页，被拒去登录，其余保留会话等待", async () => {
  const renewer = (status, retryAfter = null) => ({
    renew: async () => result(status, retryAfter),
  });
  assert.deepEqual(await resumeReading(renewer(204), "/s/a?x=1"), {
    kind: "continue",
    to: "/s/a?x=1",
  });
  assert.deepEqual(await resumeReading(renewer(204), "https://evil.test"), {
    kind: "continue",
    to: "/",
  });
  assert.deepEqual(await resumeReading(renewer(401), "/s/a?x=1"), {
    kind: "login",
    to: "/_login?returnTo=%2Fs%2Fa%3Fx%3D1",
  });
  assert.deepEqual(await resumeReading(renewer(503, 4), "/s/a"), {
    kind: "wait",
    reason: "unavailable",
    retryAfter: 4,
  });
  assert.deepEqual(await resumeReading(renewer(0), "/s/a"), {
    kind: "wait",
    reason: "offline",
    retryAfter: null,
  });
});
