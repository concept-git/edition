import { readFile, writeFile, readdir, rm } from "node:fs/promises";

// noIndex content remains directly readable, but never enters discovery surfaces.
const hidden = new Set(
  JSON.parse(await readFile(".astro/blog-noindex.json", "utf8")).map(
    (path) => new URL(path, "https://beautyclaw.cn").href,
  ),
);
for (const name of await readdir("dist")) {
  if (!/^sitemap-\d+\.xml$/.test(name)) continue;
  const path = "dist/" + name;
  const xml = await readFile(path, "utf8");
  await writeFile(
    path,
    xml.replace(/<url>.*?<\/url>/gs, (entry) => {
      const location = entry.match(/<loc>(.*?)<\/loc>/s)?.[1];
      return hidden.has(location) ? "" : entry;
    }),
  );
}
// Assets from withdrawn pages must not survive a subsequent build.
await rm("public/pagefind", { recursive: true, force: true });
