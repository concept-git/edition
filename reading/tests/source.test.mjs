import { createServer } from "node:http";
import { createHash } from "node:crypto";
import { once } from "node:events";
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  assertProductionSource,
  readSource,
  sourceFingerprint,
} from "../src/lib/space-source.ts";

async function fixture(options, check) {
  const body = Buffer.from(options.invalidUtf8 ? [255] : "正文，保留中文。\n");
  let reads = 0;
  const entry = {
    path: "/article",
    kind: "file",
    format: "html",
    title: "标题",
    sha256: createHash("sha256").update(body).digest("hex"),
    properties: {},
    seo: {},
  };
  const server = createServer((req, res) => {
    res.setHeader("Content-Type", "application/json");
    const path = new URL(req.url, "http://localhost").pathname
      .split("/")
      .at(-1);
    if (options.denied) {
      res.writeHead(403);
      res.end("{}");
      return;
    }
    if (path === "snapshot")
      res.end(JSON.stringify({ snapshot: "s1", releaseId: "r1" }));
    else if (path === "files")
      res.end(
        JSON.stringify({
          snapshot: "s1",
          entries: options.visibilityChange && reads++ > 0 ? [] : [entry],
          nextCursor: options.cursor ?? null,
        }),
      );
    else if (path === "content") {
      res.setHeader("Content-Type", "text/html");
      res.end(options.corrupt ? "changed" : body);
    } else {
      res.writeHead(404);
      res.end("{}");
    }
  });
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  try {
    await check(`http://127.0.0.1:${server.address().port}`);
  } finally {
    server.closeAllConnections();
    await new Promise((resolve) => server.close(resolve));
  }
}
test("published UTF-8 and manifest probe agree", () =>
  fixture({}, async (origin) => {
    const full = await readSource(origin, "blog"),
      probe = await readSource(origin, "blog", true);
    assert.equal(full.pages[0].content, "正文，保留中文。\n");
    assert.equal(sourceFingerprint(full), sourceFingerprint(probe));
  }));
test("digest mismatch fails", () =>
  fixture({ corrupt: true }, (origin) =>
    assert.rejects(readSource(origin, "blog"), /digest mismatch/),
  ));
test("malformed UTF-8 fails", () =>
  fixture({ invalidUtf8: true }, (origin) =>
    assert.rejects(readSource(origin, "blog"), /encoded data/),
  ));
test("changed visibility with unchanged snapshot fails", () =>
  fixture({ visibilityChange: true }, (origin) =>
    assert.rejects(readSource(origin, "blog"), /visibility changed/),
  ));
for (const cursor of [{ x: 1 }, "", "repeat"])
  test(`invalid cursor ${JSON.stringify(cursor)} fails`, () =>
    fixture({ cursor }, (origin) =>
      assert.rejects(readSource(origin, "blog"), /cursor/),
    ));
test("production build refuses a fixture source", () => {
  const previous = {
    production: process.env.SPACE_BLOG_PRODUCTION,
    fixture: process.env.SPACE_BLOG_FIXTURE,
  };
  process.env.SPACE_BLOG_PRODUCTION = "1";
  process.env.SPACE_BLOG_FIXTURE = "/tmp/blog-fixture.json";
  assert.throws(() => assertProductionSource(), /SPACE_BLOG_FIXTURE/);
  if (previous.production === undefined) delete process.env.SPACE_BLOG_PRODUCTION;
  else process.env.SPACE_BLOG_PRODUCTION = previous.production;
  if (previous.fixture === undefined) delete process.env.SPACE_BLOG_FIXTURE;
  else process.env.SPACE_BLOG_FIXTURE = previous.fixture;
});
test("anonymous denial retains HTTP status", () =>
  fixture({ denied: true }, (origin) =>
    assert.rejects(readSource(origin, "blog"), (error) => error.status === 403),
  ));
test("JSON property order does not change publication identity", () => {
  const a = {
    snapshot: "s1",
    manifest: [{ path: "/article", properties: { a: "1", b: "2" } }],
  };
  const b = {
    snapshot: "s1",
    manifest: [{ properties: { b: "2", a: "1" }, path: "/article" }],
  };
  assert.equal(sourceFingerprint(a), sourceFingerprint(b));
});
