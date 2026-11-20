import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";

// Production reads the Reader anonymous API. The fixture is only for local preview.
if (process.env.SPACE_BLOG_FIXTURE) {
  console.error(
    "Production build refuses SPACE_BLOG_FIXTURE. Use it only with astro dev for local preview.",
  );
  process.exit(1);
}

const env = { ...process.env, SPACE_BLOG_PRODUCTION: "1" };
delete env.SPACE_BLOG_FIXTURE;

function run(command, args) {
  const result = spawnSync(command, args, { stdio: "inherit", env });
  if (result.status !== 0) process.exit(result.status ?? 1);
}

run("node_modules/.bin/astro", ["check"]);
run("node_modules/.bin/astro", ["build"]);
run("node_modules/.bin/pagefind", ["--site", "dist"]);
run("node", ["scripts/finalize.mjs"]);

const source = JSON.parse(readFileSync("dist/blog-source.json", "utf8"));
if (source.mode !== "reader") {
  console.error("Production build did not read the Reader API.");
  process.exit(1);
}
console.log(`Reader snapshot ${source.snapshot}`);
