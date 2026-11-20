// Feature-first 依赖规则（reading/src-reader），见 README 的「通用阅读前端」。
// 纯函数：输入 [{ path, source }]（path 相对 src-reader，用 "/"），输出违规列表。
import { posix } from "node:path";

const pureLibraries = new Set(["marked", "sanitize-html", "cheerio"]);
const importPattern = /(?:\bfrom\s*|\bimport\s*\(?\s*)["']([^"']+)["']/g;

export function importsOf(source) {
  return [...source.matchAll(importPattern)].map((match) => match[1]);
}

function strip(path) {
  return path.replace(/\.(ts|astro|mjs|js|css)$/, "");
}

export function describe(path) {
  const parts = path.split("/");
  if (parts[0] === "features") {
    const layer = parts[2]?.replace(/\.ts$/, "");
    return { zone: "feature", feature: parts[1], layer };
  }
  if (parts[0] === "app" || parts[0] === "shared" || parts[0] === "pages")
    return { zone: parts[0] };
  return { zone: "root" };
}

export function checkArchitecture(files) {
  const violations = [];
  const known = new Set(files.map((file) => strip(file.path)));
  const fileEdges = new Map();
  const featureEdges = new Map();

  for (const file of files) {
    const from = describe(file.path);
    const dir = posix.dirname(file.path);
    const edges = [];
    fileEdges.set(strip(file.path), edges);
    const fail = (message) => violations.push(`${file.path}: ${message}`);

    if (
      from.zone === "feature" &&
      ["domain", "application"].includes(from.layer) &&
      /\bfetch\s*\(/.test(file.source)
    )
      fail(`${from.layer} 不得直接做 I/O（fetch）；通过 domain 仓储契约`);

    for (const specifier of importsOf(file.source)) {
      if (!specifier.startsWith(".")) {
        const bare = specifier.startsWith("@")
          ? specifier.split("/").slice(0, 2).join("/")
          : specifier.split("/")[0];
        if (
          from.zone === "feature" &&
          ["domain", "application", "index"].includes(from.layer)
        ) {
          const allowed =
            from.layer === "domain"
              ? pureLibraries.has(bare)
              : pureLibraries.has(bare);
          if (!allowed)
            fail(
              `${from.layer} 不得依赖 "${specifier}"（UI 框架、运行时或 I/O）`,
            );
        }
        if (
          from.zone === "shared" &&
          (bare === "astro" || bare.startsWith("astro:"))
        )
          fail(`shared 不得依赖 UI 框架 "${specifier}"`);
        continue;
      }
      const target = strip(posix.normalize(posix.join(dir, specifier)));
      if (target.startsWith("..")) {
        fail(`越出 src-reader：${specifier}`);
        continue;
      }
      if (!known.has(target) && !/\.css$/.test(specifier)) continue;
      edges.push(target);
      const to = describe(target);

      if (from.zone === "shared" && to.zone !== "shared")
        fail(`shared 不得依赖 ${to.zone}（${specifier}）`);
      if (from.zone === "pages" && to.zone !== "app")
        fail(`pages 只做薄入口，只能调用 app（${specifier}）`);
      if (from.zone === "feature") {
        if (to.zone === "app" || to.zone === "pages" || to.zone === "root")
          fail(
            `feature 不得依赖 ${to.zone}（${specifier}）；只表达意图，由 app 决定落点`,
          );
        if (to.zone === "feature" && to.feature !== from.feature) {
          if (to.layer !== "index")
            fail(
              `跨 feature 只能经公开契约 features/${to.feature}/index.ts（${specifier}）`,
            );
          const set = featureEdges.get(from.feature) ?? new Set();
          set.add(to.feature);
          featureEdges.set(from.feature, set);
        } else if (to.zone === "feature") {
          const allowedTargets = {
            domain: ["domain"],
            application: ["domain", "application"],
            data: ["domain", "data"],
            presentation: ["domain", "application", "presentation"],
            index: ["domain", "application"],
          }[from.layer];
          if (!allowedTargets) fail(`未知层 ${from.layer}`);
          else if (!allowedTargets.includes(to.layer))
            fail(`${from.layer} 不得依赖 ${to.layer}（${specifier}）`);
        }
        if (
          to.zone === "shared" &&
          from.layer === "domain" &&
          target.startsWith("shared/http")
        )
          fail(`domain 不得依赖 shared/http（${specifier}）`);
        if (
          to.zone === "shared" &&
          from.layer === "application" &&
          target.startsWith("shared/http")
        )
          fail(`application 不得依赖 shared/http（${specifier}）`);
      }
    }
  }

  const cycle = (graph, label) => {
    const state = new Map();
    const stack = [];
    const visit = (node) => {
      state.set(node, 1);
      stack.push(node);
      for (const next of graph.get(node) ?? []) {
        if (state.get(next) === 1)
          violations.push(
            `${label}循环依赖：${[...stack.slice(stack.indexOf(next)), next].join(" -> ")}`,
          );
        else if (!state.has(next)) visit(next);
      }
      stack.pop();
      state.set(node, 2);
    };
    for (const node of graph.keys()) if (!state.has(node)) visit(node);
  };
  cycle(featureEdges, "feature ");
  cycle(fileEdges, "文件");
  return violations;
}
