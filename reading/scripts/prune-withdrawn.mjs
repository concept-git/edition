import {
  cp,
  readFile,
  writeFile,
  readdir,
  rm,
  realpath,
} from "node:fs/promises";
import { resolve, join, relative, sep } from "node:path";
import { pathToFileURL } from "node:url";
import { execFileSync } from "node:child_process";
import { load } from "cheerio";

const origin = "https://beautyclaw.cn";
function route(value) {
  try {
    const url = new URL(value, origin);
    return url.origin === origin
      ? decodeURIComponent(url.pathname).replace(/\/+$/, "") || "/"
      : null;
  } catch {
    return null;
  }
}
function output(root, path) {
  const target = resolve(root, "." + path);
  if (
    !path.startsWith("/") ||
    path === "/" ||
    path.split("/").some((part) => part === "." || part === "..") ||
    !target.startsWith(root + sep)
  )
    throw new Error("Unsafe published path");
  return target;
}
async function files(root, extension) {
  const result = [];
  for (const entry of await readdir(root, { withFileTypes: true })) {
    const path = join(root, entry.name);
    if (entry.isDirectory()) result.push(...(await files(path, extension)));
    else if (entry.isFile() && (!extension || path.endsWith(extension)))
      result.push(path);
  }
  return result;
}

// Only a staging directory is changed. The caller publishes it after search succeeds.
export async function pruneWithdrawn(source, destination, nextPaths) {
  source = await realpath(source);
  destination = resolve(destination);
  if (destination === source || destination.startsWith(source + sep))
    throw new Error("Staging must be outside current site");
  const previous = JSON.parse(
    await readFile(join(source, "blog-source.json"), "utf8"),
  );
  const allowed = new Set(nextPaths),
    removed = new Set(previous.paths.filter((path) => !allowed.has(path)));
  const blockedMedia = new Set();
  for (const path of removed) {
    output(destination, path);
    if (previous.attachments?.[path])
      blockedMedia.add(previous.attachments[path]);
    else if (path.startsWith("/attachments/"))
      throw new Error("Missing attachment provenance; refusing stale media");
  }
  await cp(source, destination, {
    recursive: true,
    errorOnExist: true,
    force: false,
  });
  for (const path of removed)
    await rm(join(output(destination, path), "index.html"), { force: true });
  const htmlFiles = await files(destination, ".html");
  function removeLinks($) {
    $("a[href]").each((_, element) => {
      const a = $(element);
      if (!removed.has(route(a.attr("href")))) return;
      const row = a.closest("li");
      const card = a.closest("article");
      if (row.length) row.remove();
      else if (card.parent().closest("article").length) card.remove();
      else a.remove();
    });
  }
  // Empty tag/archive pagination routes must not retain withdrawn discovery entries.
  for (const path of htmlFiles) {
    const $ = load(await readFile(path, "utf8"));
    removeLinks($);
    const name = relative(destination, path).split(sep).join("/");
    if (
      /^(tag\/|blog\/\d+\/)/.test(name) &&
      !$("main li h2, main li h3").length
    ) {
      removed.add("/" + name.replace(/\/index\.html$/, ""));
      await rm(path);
      continue;
    }
    await writeFile(path, $.html());
  }
  const referencedMedia = new Set();
  for (const path of await files(destination, ".html")) {
    const $ = load(await readFile(path, "utf8"));
    removeLinks($);
    $("[src],[href],meta[content]").each((_, element) => {
      const node = $(element);
      for (const attribute of ["src", "href", "content"]) {
        const value = route(node.attr(attribute));
        if (blockedMedia.has(value)) {
          node.remove();
          break;
        }
        if (value?.startsWith("/media/")) referencedMedia.add(value);
      }
    });
    await writeFile(path, $.html());
  }
  for (const path of await files(destination, ".xml")) {
    const $ = load(await readFile(path, "utf8"), { xmlMode: true });
    $("item,url").each((_, element) => {
      if (removed.has(route($(element).children("link,loc").first().text())))
        $(element).remove();
    });
    await writeFile(path, $.xml());
  }
  for (const path of await files(join(destination, "media"))) {
    const href = "/" + relative(destination, path).split(sep).join("/");
    if (blockedMedia.has(href) || !referencedMedia.has(href)) await rm(path);
  }
  await rm(join(destination, "pagefind"), { recursive: true, force: true });
  await writeFile(
    join(destination, "blog-source.json"),
    JSON.stringify({
      ...previous,
      mode: "pruned",
      fingerprint: null,
      paths: previous.paths.filter((path) => allowed.has(path)),
      attachments: Object.fromEntries(
        Object.entries(previous.attachments ?? {}).filter(([path]) =>
          allowed.has(path),
        ),
      ),
      prunedAt: new Date().toISOString(),
    }),
  );
  return [...removed];
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(resolve(process.argv[1])).href
) {
  const [source, destination, manifest] = process.argv.slice(2);
  const next = JSON.parse(await readFile(manifest, "utf8"));
  const removed = await pruneWithdrawn(source, destination, next.paths);
  execFileSync(resolve("node_modules/.bin/pagefind"), ["--site", destination], {
    stdio: "inherit",
  });
  process.stdout.write(`Pruned ${removed.length} withdrawn routes\n`);
}
