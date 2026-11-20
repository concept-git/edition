// 把 feature-first 依赖规则变成可执行检查：node scripts/check-architecture.mjs
import { readdir, readFile } from "node:fs/promises";
import { join, relative, sep } from "node:path";
import { checkArchitecture } from "./architecture-rules.mjs";

const root = new URL("../src-reader/", import.meta.url).pathname;
async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const nested = await Promise.all(
    entries.map((entry) =>
      entry.isDirectory()
        ? walk(join(dir, entry.name))
        : /\.(ts|astro|mjs)$/.test(entry.name)
          ? [join(dir, entry.name)]
          : [],
    ),
  );
  return nested.flat();
}
const files = await Promise.all(
  (await walk(root)).map(async (file) => ({
    path: relative(root, file).split(sep).join("/"),
    source: await readFile(file, "utf8"),
  })),
);
const violations = checkArchitecture(files);
if (violations.length) {
  process.stderr.write(violations.join("\n") + "\n");
  process.stderr.write(`\n架构检查失败：${violations.length} 处违规\n`);
  process.exit(1);
}
process.stdout.write(`架构检查通过（${files.length} 个文件）\n`);
