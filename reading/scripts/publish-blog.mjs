#!/usr/bin/env node
/**
 * Write reading/content into the BeautyClaw website Space.
 *
 * Required when not using --dry-run:
 *   EDITION_CONTROL_ORIGIN   Control base URL, no trailing path
 *   EDITION_CONTROL_TOKEN    management bearer token (not logged)
 *
 * The script creates or reuses an authored space, turns on autoRelease,
 * binds site host beautyclaw.cn, mounts slug blog, grants anonymous reader,
 * then writes Markdown, blog_* properties, SEO description, and publish.
 */
import { createHash } from "node:crypto";
import { readdir, readFile } from "node:fs/promises";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const host = "beautyclaw.cn";
const mountSlug = "blog";
const spaceName = "BeautyClaw 博客";
const siteName = "BeautyClaw";
const columns = {
  human: "日常心理与行为",
  systems: "生活中的系统",
  "software-new-science": "AI 对齐与工程",
  "practical-philosophy": "实用哲学",
  "learning-ai": "学习与 AI",
};
const tagSlugs = {
  概念: "concepts",
  系统: "systems",
  本体论: "ontology",
  研究: "research",
};

const dryRun = process.argv.includes("--dry-run");
const origin = (process.env.EDITION_CONTROL_ORIGIN ?? "").replace(/\/$/, "");
const token = process.env.EDITION_CONTROL_TOKEN ?? "";

function fail(message) {
  console.error(message);
  process.exit(1);
}

function parsePage(slug, source) {
  const match = source.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!match) fail(`Missing front matter: ${slug}`);
  const fields = {};
  for (const line of match[1].split("\n")) {
    const split = line.indexOf(":");
    if (split === -1) continue;
    fields[line.slice(0, split).trim()] = line.slice(split + 1).trim();
  }
  const kind = fields.kind;
  if (!["post", "guide", "page"].includes(kind)) fail(`Unknown kind: ${slug}`);
  if (kind === "page" && slug !== "about") fail(`Unsupported fixed page: ${slug}`);
  if (kind === "guide") {
    const [column, topic] = slug.split("/");
    if (!topic || !columns[column]) fail(`Guide must be <column>/<topic>: ${slug}`);
  }
  if (fields.category && !columns[fields.category]) {
    fail(`Unknown category: ${slug}`);
  }
  const names = (fields.tags ?? "")
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
  const tags = names.map((name) => ({
    slug: tagSlugs[name] ?? name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    name,
  }));
  return {
    slug,
    kind,
    title: fields.title,
    description: fields.description ?? "",
    category: fields.category ?? "",
    categoryLabel: fields.category ? columns[fields.category] : "",
    pubDate: fields.pubDate,
    tags,
    body: match[2].trim() + "\n",
  };
}

async function loadPages() {
  const root = fileURLToPath(new URL("../content/", import.meta.url));
  const files = [];
  async function walk(directory) {
    for (const entry of await readdir(directory, { withFileTypes: true })) {
      const path = join(directory, entry.name);
      if (entry.isDirectory()) await walk(path);
      else if (entry.name.endsWith(".md")) files.push(path);
    }
  }
  await walk(root);
  return Promise.all(
    files.map(async (file) => {
      const slug = relative(root, file).replace(/\.md$/, "").split("\\").join("/");
      return parsePage(slug, await readFile(file, "utf8"));
    }),
  );
}

const pages = (await loadPages()).sort((a, b) => a.slug.localeCompare(b.slug));
if (!pages.some((page) => page.slug === "about")) fail("Missing fixed page: about");

if (dryRun) {
  for (const page of pages) {
    console.log(
      `${page.kind}\t${page.slug}\t${page.title}\t${page.category || "-"}\t${page.pubDate ?? "-"}`,
    );
  }
  process.exit(0);
}

if (!origin || !token) {
  fail(
    "Control is not configured. Set EDITION_CONTROL_ORIGIN and EDITION_CONTROL_TOKEN. " +
      "This host currently serves only the static site, so the Reader API is not available yet.",
  );
}

async function api(method, path, { body, headers = {}, ok = [200] } = {}) {
  const response = await fetch(new URL(path, origin), {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
      ...headers,
      ...(body
        ? {
            "Content-Type": headers["Content-Type"] ?? "application/json",
          }
        : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await response.text();
  let parsed = null;
  if (text) {
    try {
      parsed = JSON.parse(text);
    } catch {
      parsed = { detail: text.slice(0, 300) };
    }
  }
  if (!ok.includes(response.status)) {
    const violations = Array.isArray(parsed?.violations)
      ? ` ${JSON.stringify(parsed.violations)}`
      : "";
    const detail = parsed?.detail || parsed?.title || text.slice(0, 300);
    fail(`${method} ${path} -> HTTP ${response.status}: ${detail}${violations}`);
  }
  return { status: response.status, body: parsed, etag: response.headers.get("etag") };
}

async function listAll(path) {
  const items = [];
  let cursor = null;
  do {
    const url = new URL(path, origin);
    url.searchParams.set("limit", "100");
    if (cursor) url.searchParams.set("cursor", cursor);
    const page = await api("GET", url.pathname + url.search, { ok: [200] });
    items.push(...(page.body.items ?? []));
    cursor = page.body.nextCursor;
  } while (cursor);
  return items;
}

function key(name) {
  return name.replace(/[^a-zA-Z0-9._:-]/g, "-").slice(0, 128);
}

const me = await api("GET", "/api/v1/me");
const tenantId = process.env.EDITION_BLOG_TENANT || me.body.tenants?.[0]?.id;
if (!tenantId) fail("The management token has no tenant.");

let space = (await listAll(`/api/v1/tenants/${tenantId}/spaces`)).find(
  (item) => item.name === spaceName,
);
if (!space) {
  const created = await api("POST", `/api/v1/tenants/${tenantId}/spaces`, {
    ok: [201],
    headers: { "Idempotency-Key": "blog-space-beautyclaw" },
    body: { name: spaceName, mode: "authored" },
  });
  space = created.body;
}
await api("PATCH", `/api/v1/tenants/${tenantId}/spaces/${space.id}`, {
  headers: {
    "Content-Type": "application/merge-patch+json",
    "Idempotency-Key": "blog-space-autorelease",
  },
  body: {
    autoRelease: true,
    description: "概念设计、本体论、软件架构。",
  },
});

let site = (await listAll(`/api/v1/tenants/${tenantId}/sites`)).find((item) =>
  (item.domains ?? []).some((domain) => domain.host === host),
);
if (!site) {
  site = (
    await listAll(`/api/v1/tenants/${tenantId}/sites`)
  ).find((item) => item.name === siteName);
}
if (!site) {
  const created = await api("POST", `/api/v1/tenants/${tenantId}/sites`, {
    ok: [201],
    headers: { "Idempotency-Key": "blog-site-beautyclaw" },
    body: { name: siteName },
  });
  site = created.body;
}
const sitePath = `/api/v1/tenants/${tenantId}/sites/${site.id}`;
let detail = (await api("GET", sitePath)).body;
if (!(detail.domains ?? []).some((domain) => domain.host === host)) {
  await api("POST", `${sitePath}/domains`, {
    ok: [200, 201, 409],
    headers: { "Idempotency-Key": "blog-domain-beautyclaw" },
    body: { host },
  });
  detail = (await api("GET", sitePath)).body;
}
let domain = (detail.domains ?? []).find((item) => item.host === host);
if (domain && !domain.verified) {
  const verified = await api(
    "POST",
    `${sitePath}/domains/${encodeURIComponent(host)}:verify`,
    {
      ok: [200],
      headers: { "Idempotency-Key": "blog-domain-verify" },
      body: {},
    },
  );
  domain = verified.body?.domain ?? verified.body ?? domain;
  detail = (await api("GET", sitePath)).body;
  domain = (detail.domains ?? []).find((item) => item.host === host) ?? domain;
}
if (domain?.verified && !domain.isPrimary) {
  await api("POST", `${sitePath}/domains/${encodeURIComponent(host)}:setPrimary`, {
    ok: [200, 204],
    headers: { "Idempotency-Key": "blog-domain-primary" },
    body: {},
  });
}
const mount = (detail.mounts ?? []).find((item) => item.slug === mountSlug);
if (mount && mount.spaceId !== space.id) {
  fail(`Site slug ${mountSlug} already mounts a different space.`);
}
if (!mount) {
  await api("PUT", `${sitePath}/mounts/${mountSlug}`, {
    headers: { "Idempotency-Key": "blog-mount-blog" },
    body: { spaceId: space.id },
  });
}
await api(
  "PUT",
  `${sitePath}/permissions/grants/anonymous`,
  { body: { role: "reader" } },
);

const existing = await listAll(
  `/api/v1/tenants/${tenantId}/spaces/${space.id}/pages`,
);
const bySlug = new Map(existing.map((page) => [page.slug.replace(/^\/+/, ""), page]));
const publishedIds = [];

for (const page of pages) {
  let current = bySlug.get(page.slug);
  if (!current) {
    const created = await api(
      "POST",
      `/api/v1/tenants/${tenantId}/spaces/${space.id}/pages`,
      {
        ok: [201],
        headers: { "Idempotency-Key": key(`blog-create-${page.slug}`) },
        body: { format: "markdown", title: page.title, slug: page.slug },
      },
    );
    current = created.body;
  }
  const contentPath = `/api/v1/tenants/${tenantId}/spaces/${space.id}/pages/${current.id}/content`;
  const snapshot = await api("GET", contentPath);
  if (snapshot.body.content !== page.body) {
    const digest = createHash("sha256").update(page.body).digest("hex").slice(0, 12);
    const match = snapshot.etag || `"rev-${snapshot.body.revision}"`;
    await api("PUT", contentPath, {
      headers: {
        "If-Match": match,
        "Idempotency-Key": key(`blog-edit-v2-${page.slug}-${digest}`),
      },
      body: { content: page.body, intent: "draft_only" },
    });
  }
  const properties = {
    blog_kind: page.kind,
    blog_published_at: page.pubDate ?? "",
    blog_category: page.category,
    blog_category_label: page.categoryLabel,
    blog_tags: JSON.stringify(page.tags),
  };
  for (const [field, value] of Object.entries(properties)) {
    const digest = createHash("sha256").update(value).digest("hex").slice(0, 12);
    await api(
      "PUT",
      `/api/v1/tenants/${tenantId}/spaces/${space.id}/pages/${current.id}/properties/${field}`,
      {
        ok: [200, 201],
        headers: { "Idempotency-Key": key(`blog-prop-${page.slug}-${field}-${digest}`) },
        body: { value },
      },
    );
  }
  const seoDigest = createHash("sha256")
    .update(page.description)
    .digest("hex")
    .slice(0, 12);
  await api(
    "PATCH",
    `/api/v1/tenants/${tenantId}/spaces/${space.id}/pages/${current.id}/seo`,
    {
      headers: {
        "Content-Type": "application/merge-patch+json",
        "Idempotency-Key": key(`blog-seo-${page.slug}-${seoDigest}`),
      },
      body: { description: page.description, noIndex: false },
    },
  );
  publishedIds.push(current.id);
  console.log(`wrote ${page.slug}`);
}

const publicationKey = createHash("sha256")
  .update(publishedIds.join("\n"))
  .digest("hex")
  .slice(0, 12);
const publication = await api(
  "POST",
  `/api/v1/tenants/${tenantId}/spaces/${space.id}/pages:publish`,
  {
    headers: { "Idempotency-Key": `blog-publish-${publicationKey}` },
    body: { ids: publishedIds },
  },
);
console.log(
  `published ${publishedIds.length} pages outcome=${publication.body.outcome ?? "ok"}`,
);
if (!domain?.verified) {
  console.log(
    `Domain ${host} is not verified yet. Anonymous Reader on this host stays blocked until Control can verify it.`,
  );
}
