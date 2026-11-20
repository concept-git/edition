import { readdir, readFile } from "node:fs/promises";
import { join, relative, sep } from "node:path";
import { test } from "node:test";
import assert from "node:assert/strict";
import { checkArchitecture } from "../scripts/architecture-rules.mjs";

const f = (path, source) => ({ path, source });
const check = (...files) => checkArchitecture(files);
const hasViolation = (violations, text) =>
  violations.some((v) => v.includes(text));

test("domain 不得依赖 data/presentation/astro/node/fetch", () => {
  const v = check(
    f(
      "features/a/domain/x.ts",
      'import { r } from "../data/r.ts"; import "astro"; import fs from "node:fs"; fetch("/x");',
    ),
    f("features/a/data/r.ts", ""),
  );
  assert.ok(hasViolation(v, "domain 不得依赖 data"));
  assert.ok(hasViolation(v, '不得依赖 "astro"'));
  assert.ok(hasViolation(v, '"node:fs"'));
  assert.ok(hasViolation(v, "fetch"));
});

test("presentation 不得依赖 data；data 不得依赖 application/presentation", () => {
  const v = check(
    f("features/a/presentation/V.astro", 'import { r } from "../data/r.ts"'),
    f("features/a/data/r.ts", 'import { u } from "../application/u.ts"'),
    f("features/a/application/u.ts", ""),
  );
  assert.ok(hasViolation(v, "presentation 不得依赖 data"));
  assert.ok(hasViolation(v, "data 不得依赖 application"));
});

test("跨 feature 只能经 index.ts；feature 不得依赖 app/pages", () => {
  const v = check(
    f(
      "features/a/domain/x.ts",
      'import "../../b/domain/y.ts"; import "../../../app/c.ts"',
    ),
    f("features/b/domain/y.ts", ""),
    f("app/c.ts", ""),
  );
  assert.ok(hasViolation(v, "公开契约"));
  assert.ok(hasViolation(v, "feature 不得依赖 app"));
  assert.deepEqual(
    check(
      f("features/a/domain/x.ts", 'import "../../b/index.ts"'),
      f("features/b/index.ts", ""),
    ),
    [],
  );
});

test("feature 之间不得循环依赖；文件循环也被发现", () => {
  const v = check(
    f("features/a/domain/x.ts", 'import "../../b/index.ts"'),
    f("features/a/index.ts", ""),
    f("features/b/domain/y.ts", 'import "../../a/index.ts"'),
    f("features/b/index.ts", ""),
  );
  assert.ok(hasViolation(v, "feature 循环依赖"));
  const files = check(
    f("shared/a.ts", 'import "./b.ts"'),
    f("shared/b.ts", 'import "./a.ts"'),
  );
  assert.ok(hasViolation(files, "文件循环依赖"));
});

test("pages 只调用 app；shared 不依赖 feature/app", () => {
  const v = check(
    f("pages/i.astro", 'import "../features/a/index.ts"'),
    f("features/a/index.ts", ""),
    f("shared/s.ts", 'import "../app/c.ts"'),
    f("app/c.ts", ""),
  );
  assert.ok(hasViolation(v, "pages 只做薄入口"));
  assert.ok(hasViolation(v, "shared 不得依赖 app"));
});

test("src-reader 实际源码满足依赖规则", async () => {
  const root = new URL("../src-reader/", import.meta.url).pathname;
  const walk = async (dir) =>
    (
      await Promise.all(
        (await readdir(dir, { withFileTypes: true })).map((e) =>
          e.isDirectory()
            ? walk(join(dir, e.name))
            : /\.(ts|astro)$/.test(e.name)
              ? [join(dir, e.name)]
              : [],
        ),
      )
    ).flat();
  const files = await Promise.all(
    (await walk(root)).map(async (p) =>
      f(relative(root, p).split(sep).join("/"), await readFile(p, "utf8")),
    ),
  );
  assert.ok(files.length > 20);
  assert.deepEqual(checkArchitecture(files), []);
});
