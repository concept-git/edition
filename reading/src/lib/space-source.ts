import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";

export interface Resource {
  path: string;
  kind: string;
  pageId: string | null;
  title: string | null;
  format: string | null;
  sha256: string | null;
  promotedAt: string | null;
  properties: Record<string, string>;
  seo: Record<string, string>;
}
export interface PublishedPage extends Resource {
  content: string;
}
export interface PublishedSource {
  mode: "reader" | "fixture";
  snapshot: string;
  releaseId: string | null;
  origin: string;
  space: string;
  pages: PublishedPage[];
  attachments: { entry: Resource; bytes: Uint8Array }[];
  manifest?: Resource[];
}
const maximumBytes = 64 * 1024 * 1024;
function stableJson(value: unknown): string {
  return JSON.stringify(value, (_key, item) =>
    item && typeof item === "object" && !Array.isArray(item)
      ? Object.fromEntries(
          Object.entries(item).sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0)),
        )
      : item,
  );
}
export class SourceError extends Error {
  status?: number;
  constructor(message: string, status?: number) {
    super(message);
    this.status = status;
  }
}

export async function readSource(
  origin: string,
  space: string,
  manifestOnly = false,
): Promise<PublishedSource> {
  const base = new URL(
    `/api/content/spaces/${encodeURIComponent(space)}/`,
    origin,
  );
  async function request(path: string, query: Record<string, string> = {}) {
    const url = new URL(path, base);
    for (const [key, value] of Object.entries(query))
      url.searchParams.set(key, value);
    const response = await fetch(url, {
      headers: { Accept: "application/json, text/plain, */*" },
      cache: "no-store",
      signal: AbortSignal.timeout(30000),
    });
    if (!response.ok)
      throw new SourceError(
        `Reader ${path}: HTTP ${response.status}`,
        response.status,
      );
    const bytes = new Uint8Array(await response.arrayBuffer());
    if (bytes.length > maximumBytes)
      throw new SourceError("Reader resource exceeds 64 MiB");
    return bytes;
  }
  const decoder = new TextDecoder("utf-8", { fatal: true });
  async function json(path: string, query?: Record<string, string>) {
    return JSON.parse(decoder.decode(await request(path, query)));
  }
  const snapshot = await json("snapshot");
  if (typeof snapshot.snapshot !== "string" || !snapshot.snapshot)
    throw new SourceError("Reader snapshot is invalid");
  async function listing() {
    const entries: Resource[] = [];
    let cursor: string | null = null;
    const seen = new Set<string>();
    do {
      const page = await json("files", {
        snapshot: snapshot.snapshot,
        limit: "100",
        ...(cursor ? { cursor } : {}),
      });
      if (page.snapshot !== snapshot.snapshot || !Array.isArray(page.entries))
        throw new SourceError("Reader listing changed during build", 409);
      for (const entry of page.entries) {
        if (
          typeof entry.path !== "string" ||
          !["file", "directory"].includes(entry.kind)
        )
          throw new SourceError("Reader file metadata is invalid");
        entries.push(entry);
      }
      cursor = page.nextCursor;
      if (
        cursor !== null &&
        (typeof cursor !== "string" || !cursor || seen.has(cursor))
      )
        throw new SourceError("Reader returned an invalid or repeated cursor");
      if (cursor) seen.add(cursor);
      if (seen.size > 1000)
        throw new SourceError("Reader listing exceeds 1000 pages");
    } while (cursor !== null);
    return entries;
  }
  const entries = await listing();
  const pages: PublishedPage[] = [],
    attachments: PublishedSource["attachments"] = [];
  const files = manifestOnly
    ? []
    : entries.filter((entry) => entry.kind === "file");
  let next = 0;
  await Promise.all(
    Array.from({ length: Math.min(2, files.length) }, async () => {
      while (next < files.length) {
        const entry = files[next++];
        const bytes = await request("content", {
          snapshot: snapshot.snapshot,
          path: entry.path,
        });
        if (
          !entry.sha256 ||
          createHash("sha256").update(bytes).digest("hex") !== entry.sha256
        )
          throw new SourceError(`Reader digest mismatch: ${entry.path}`);
        if (entry.format)
          pages.push({ ...entry, content: decoder.decode(bytes) });
        else attachments.push({ entry, bytes });
      }
    }),
  );
  const current = await json("snapshot");
  const latest = await listing();
  if (
    current.snapshot !== snapshot.snapshot ||
    stableJson(latest) !== stableJson(entries)
  )
    throw new SourceError(
      "Publication or anonymous visibility changed during build",
      409,
    );
  pages.sort((a, b) => a.path.localeCompare(b.path));
  return {
    mode: "reader",
    snapshot: snapshot.snapshot,
    releaseId: snapshot.releaseId,
    origin,
    space,
    pages,
    attachments,
    manifest: entries,
  };
}

export function assertProductionSource(): void {
  if (process.env.SPACE_BLOG_PRODUCTION === "1" && process.env.SPACE_BLOG_FIXTURE) {
    throw new SourceError(
      "Production build refuses SPACE_BLOG_FIXTURE",
    );
  }
}

let source: Promise<PublishedSource> | undefined;
export function publishedSource(): Promise<PublishedSource> {
  source ??= (async () => {
    assertProductionSource();
    const origin = process.env.SPACE_BLOG_SOURCE ?? "https://beautyclaw.cn";
    const space = process.env.SPACE_BLOG_SPACE ?? "blog";
    if (!process.env.SPACE_BLOG_FIXTURE) return readSource(origin, space);
    const entries = JSON.parse(
      await readFile(process.env.SPACE_BLOG_FIXTURE, "utf8"),
    );
    return {
      mode: "fixture",
      snapshot: "local-preview",
      releaseId: null,
      origin,
      space,
      attachments: [],
      pages: entries.map((entry: any) => ({
        path: "/" + entry.slug,
        kind: "file",
        pageId: "preview-" + entry.slug,
        title: entry.title,
        format: "html",
        sha256: null,
        promotedAt: entry.pubDate,
        content: entry.html,
        properties: {
          blog_kind: entry.kind ?? "post",
          blog_published_at: entry.pubDate,
          blog_category: entry.category,
          blog_category_label: entry.categoryLabel,
          blog_tags: JSON.stringify(entry.tags),
          blog_cover: entry.cover ?? "",
        },
        seo: { description: entry.description },
      })),
    };
  })();
  return source;
}

export function sourceFingerprint(source: PublishedSource): string {
  return createHash("sha256")
    .update(
      stableJson({
        snapshot: source.snapshot,
        entries: (source.manifest ?? source.pages).toSorted((a, b) =>
          a.path.localeCompare(b.path),
        ),
      }),
    )
    .digest("hex");
}
