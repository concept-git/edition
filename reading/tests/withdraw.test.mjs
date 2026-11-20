import { test } from "node:test";
import assert from "node:assert/strict";
import {
  mkdtemp,
  mkdir,
  writeFile,
  readFile,
  access,
  rm,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { execFileSync } from "node:child_process";
import { pruneWithdrawn } from "../scripts/prune-withdrawn.mjs";

test("withdrawal removes discovery and private media while preserving sibling articles", async () => {
  const root = await mkdtemp(join(tmpdir(), "space-withdraw-"));
  const source = join(root, "current"),
    stage = join(root, "stage");
  async function file(path, text) {
    const target = join(source, path);
    await mkdir(join(target, ".."), { recursive: true });
    await writeFile(target, text);
  }
  try {
    const stamp = {
      mode: "reader",
      fingerprint: "old",
      paths: ["/gone", "/gone/child", "/attachments/private"],
      attachments: { "/attachments/private": "/media/private.svg" },
    };
    await file("blog-source.json", JSON.stringify(stamp));
    await file(
      "index.html",
      '<html lang="en"><main><ul><li><a href="/gone">withdrawn-title</a><p>withdrawn-excerpt</p></li><li><a href="/gone/child">stays</a></li></ul></main></html>',
    );
    await file(
      "gone/index.html",
      '<html lang="en"><article data-pagefind-body>withdrawn-content-secret</article></html>',
    );
    await file(
      "gone/child/index.html",
      '<html lang="en"><article data-pagefind-body>remaining-content-unique<img src="/media/shared.svg"><img src="/media/private.svg"></article></html>',
    );
    await file(
      "tag/only-gone/index.html",
      '<main><ul><li><h2><a href="/gone">withdrawn-title</a></h2></li></ul></main>',
    );
    await file(
      "tags/index.html",
      '<main><ul><li><a href="/tag/only-gone">withdrawn-tag</a></li></ul></main>',
    );
    await file(
      "rss.xml",
      "<rss><channel><item><link>https://beautyclaw.cn/gone</link><title>withdrawn-title</title></item><item><link>https://beautyclaw.cn/gone/child</link><title>stays</title></item></channel></rss>",
    );
    await file(
      "sitemap-0.xml",
      "<urlset><url><loc>https://beautyclaw.cn/gone</loc></url><url><loc>https://beautyclaw.cn/tag/only-gone</loc></url><url><loc>https://beautyclaw.cn/gone/child</loc></url></urlset>",
    );
    for (const name of ["private.svg", "orphan.svg", "shared.svg"])
      await file("media/" + name, "<svg/>");
    await file("pagefind/old.pf_fragment", "withdrawn-cached-search");
    const removed = await pruneWithdrawn(source, stage, ["/gone/child"]);
    assert.deepEqual(
      new Set(removed),
      new Set(["/gone", "/attachments/private", "/tag/only-gone"]),
    );
    for (const path of [
      "gone/index.html",
      "tag/only-gone/index.html",
      "media/private.svg",
      "media/orphan.svg",
      "pagefind/old.pf_fragment",
    ])
      await assert.rejects(access(join(stage, path)));
    const home = await readFile(join(stage, "index.html"), "utf8");
    assert(!home.includes("withdrawn-"));
    assert(home.includes("stays"));
    assert(
      !(await readFile(join(stage, "tags/index.html"), "utf8")).includes(
        "withdrawn-tag",
      ),
    );
    for (const path of ["rss.xml", "sitemap-0.xml"]) {
      const xml = await readFile(join(stage, path), "utf8");
      assert(xml.includes("/gone/child"));
      assert(!xml.includes("withdrawn-title"));
      assert(!xml.includes("only-gone"));
    }
    const child = await readFile(join(stage, "gone/child/index.html"), "utf8");
    assert(child.includes("remaining-content-unique"));
    assert(!child.includes("private.svg"));
    await access(join(stage, "media/shared.svg"));
    const next = JSON.parse(
      await readFile(join(stage, "blog-source.json"), "utf8"),
    );
    assert.equal(next.mode, "pruned");
    assert.equal(next.fingerprint, null);
    assert.deepEqual(next.attachments, {});
    assert.deepEqual(next.paths, ["/gone/child"]);
    assert(
      (await readFile(join(source, "gone/index.html"), "utf8")).includes(
        "withdrawn-content-secret",
      ),
    );
    execFileSync(resolve("node_modules/.bin/pagefind"), ["--site", stage], {
      stdio: "pipe",
    });
    await access(join(stage, "pagefind/pagefind-entry.json"));
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("invalid published paths are rejected before creating a staged site", async () => {
  const root = await mkdtemp(join(tmpdir(), "space-withdraw-boundary-"));
  try {
    const source = join(root, "current"),
      stage = join(root, "stage");
    await mkdir(source);
    await writeFile(
      join(source, "blog-source.json"),
      JSON.stringify({ paths: ["/../../outside"] }),
    );
    await assert.rejects(
      pruneWithdrawn(source, stage, []),
      /Unsafe published path/,
    );
    await assert.rejects(access(stage));
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
