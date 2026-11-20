import type { Loader } from "astro/loaders";
import { createHash } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import { load } from "cheerio";
import sanitizeHtml from "sanitize-html";
import { publishedSource, sourceFingerprint } from "../lib/space-source";
import { slugifyStr } from "../utils/slugify";

const reserved = new Set([
  "blog",
  "posts",
  "category",
  "tag",
  "tags",
  "search",
  "archives",
  "about",
  "api",
  "v1",
  "media",
  "human",
  "systems",
  "software-new-science",
  "practical-philosophy",
  "learning-ai",
]);
const hash = (value: string | Uint8Array) =>
  createHash("sha256").update(value).digest("hex");
const media = new URL("../../public/media/", import.meta.url);
const safeStyles = Object.fromEntries(
  [
    "color",
    "background-color",
    "--shiki-light",
    "--shiki-dark",
    "--shiki-light-bg",
    "--shiki-dark-bg",
  ].map((name) => [
    name,
    [/^#[0-9a-fA-F]{3,8}$/, /^rgba?\([0-9.,% ]+\)$/, /^[a-zA-Z]+$/],
  ]),
);

export function spaceCollection(kind: "post" | "page"): Loader {
  return {
    name: "space-published-" + kind,
    async load({ store, parseData, renderMarkdown, generateDigest, logger }) {
      const source = await publishedSource();
      await mkdir(media, { recursive: true });
      const assets = new Map<string, string>();
      for (const { entry, bytes } of source.attachments) {
        const extension =
          entry.path.match(/\.([a-zA-Z0-9]{1,8})$/)?.[1] ?? "bin";
        const name = hash(bytes) + "." + extension.toLowerCase();
        await writeFile(new URL(name, media), bytes);
        const href = "/media/" + name;
        assets.set(entry.path.replace(/^\//, ""), href);
        // Authored conversion changes managed paths; content-addressed names remain stable.
        assets.set(name, href);
      }
      const compiled = [];
      for (const page of source.pages) {
        const props = page.properties ?? {},
          seo = page.seo ?? {};
        const contentKind = props.blog_kind ?? "post";
        if (!["post", "guide", "page"].includes(contentKind))
          throw new Error(`Unknown blog_kind: ${page.path}`);
        if (
          kind === "post"
            ? !["post", "guide"].includes(contentKind)
            : contentKind !== "page"
        )
          continue;
        const id = page.path.replace(/^\/+/, "");
        if (contentKind === "page" && id !== "about")
          throw new Error(`Unsupported fixed page: ${id}`);
        if (
          !id ||
          id
            .split("/")
            .some((segment) => segment === "." || segment === "..") ||
          (kind === "post" &&
            reserved.has(id.split("/")[0]) &&
            !(
              contentKind === "guide" &&
              [
                "human",
                "systems",
                "software-new-science",
                "practical-philosophy",
                "learning-ai",
              ].includes(id.split("/")[0]) &&
              id.includes("/")
            ))
        )
          throw new Error(`Blog resource path is reserved or invalid: ${id}`);
        const format = page.format?.toLowerCase();
        if (!["markdown", "html"].includes(format ?? ""))
          throw new Error(`Blog requires Markdown or HTML: ${id}`);
        const rendered =
          format === "markdown"
            ? await renderMarkdown(page.content)
            : { html: page.content, metadata: {} };
        const $ = load(rendered.html, {}, false);
        $("script,style,link,meta,iframe,object,embed").not("svg *").remove();
        for (const element of $("svg").toArray()) {
          const svg = $(element).toString();
          const name = hash(svg) + ".svg";
          await writeFile(new URL(name, media), svg);
          const description = $(element)
            .find("text")
            .map((_, text) => $(text).text().trim())
            .get()
            .filter(Boolean)
            .join(" · ");
          const figure = $("<figure></figure>");
          figure.append(
            $("<img>").attr({
              src: "/media/" + name,
              alt: description.slice(0, 180) || "文章图示",
              loading: "lazy",
            }),
          );
          if (description)
            figure.append(
              $("<details><summary>图示文字说明</summary></details>").append(
                $("<p></p>").text(description),
              ),
            );
          $(element).replaceWith(figure);
        }
        function rewrite(value: string) {
          if (value.startsWith("#")) return value;
          const digestName = value.match(
            /(?:^|\/)([a-f0-9]{64}\.[a-zA-Z0-9]{1,8})$/,
          )?.[1];
          const direct =
            assets.get(value.replace(/^\.?\//, "")) ??
            assets.get(digestName ?? "");
          if (direct) return direct;
          const url = new URL(
            value,
            new URL(`/${source.space}/${id}`, source.origin),
          );
          if (url.origin !== new URL(source.origin).origin) return value;
          const prefix = `/${source.space}/`;
          const resource = url.pathname.startsWith(prefix)
            ? decodeURIComponent(url.pathname.slice(prefix.length))
            : url.pathname.slice(1);
          return (
            assets.get(resource) ??
            (url.pathname.startsWith(prefix)
              ? "/" + resource + url.search + url.hash
              : value)
          );
        }
        $("[src],a[href]").each((_, element) => {
          const attribute = $(element).is("a") ? "href" : "src";
          const value = $(element).attr(attribute);
          if (value) $(element).attr(attribute, rewrite(value));
        });
        const headings: { depth: number; slug: string; text: string }[] = [];
        const ids = new Set<string>();
        $("h1,h2,h3,h4,h5,h6").each((index, element) => {
          const text = $(element).text();
          let slug =
            $(element).attr("id") || slugifyStr(text) || "section-" + index;
          const original = slug;
          let suffix = 1;
          while (ids.has(slug)) slug = original + "-" + suffix++;
          ids.add(slug);
          $(element).attr("id", slug);
          headings.push({
            depth: Number(element.tagName.slice(1)),
            slug,
            text,
          });
        });
        if (format === "html")
          $("[class]").each((_, element) => {
            const classes = ($(element).attr("class") ?? "")
              .split(/\s+/)
              .filter((value) =>
                /^(astro-code|shiki|line|language-[a-z0-9-]+)$/.test(value),
              );
            if (classes.length) $(element).attr("class", classes.join(" "));
            else $(element).removeAttr("class");
          });
        const html = sanitizeHtml($.html(), {
          allowedTags: [
            ...sanitizeHtml.defaults.allowedTags,
            "img",
            "figure",
            "figcaption",
            "details",
            "summary",
            "input",
          ],
          allowedAttributes: {
            "*": ["id", "class", "style"],
            a: ["href", "title", "rel", "target"],
            img: ["src", "alt", "width", "height", "loading"],
            input: ["type", "checked", "disabled"],
            td: ["colspan", "rowspan", "align"],
            th: ["colspan", "rowspan", "align"],
          },
          allowedStyles: { "*": safeStyles },
          allowedSchemes: ["https", "http", "mailto"],
          transformTags: {
            input: (_tagName, attributes) => ({
              tagName: "input",
              attribs: {
                type: "checkbox",
                disabled: "disabled",
                ...(attributes.checked !== undefined
                  ? { checked: "checked" }
                  : {}),
              },
            }),
          },
        });
        const tags = JSON.parse(props.blog_tags ?? "[]") as {
          slug: string;
          name: string;
        }[];
        if (
          !Array.isArray(tags) ||
          tags.some(
            (tag) =>
              typeof tag.slug !== "string" || typeof tag.name !== "string",
          )
        )
          throw new Error(`Invalid blog_tags: ${id}`);
        const cover = props.blog_cover
          ? rewrite(props.blog_cover)
          : seo.ogImage;
        const data = await parseData({
          id,
          data: {
            kind: contentKind,
            title: page.title,
            description: seo.description ?? "",
            author: props.blog_author ?? "Shuai.Stuff",
            pubDatetime: props.blog_published_at || page.promotedAt,
            modDatetime: props.blog_updated_at || undefined,
            category: props.blog_category || "software-new-science",
            categoryLabel: props.blog_category_label || undefined,
            tags: tags.map((tag) => tag.name),
            tagSlugs: Object.fromEntries(
              tags.map((tag) => [tag.name, tag.slug]),
            ),
            ogImage: cover || undefined,
            canonicalURL: new URL("/" + id, "https://beautyclaw.cn").href,
            featured: props.blog_featured === "true",
            draft: false,
            hideEditPost: true,
            noIndex: seo.noIndex === "true",
          },
        });
        compiled.push({
          id,
          data,
          body: page.content,
          digest: generateDigest({ content: page.content, data }),
          rendered: { html, metadata: { headings } },
        });
      }
      await writeFile(
        new URL("../../.astro/blog-noindex.json", import.meta.url),
        JSON.stringify(
          source.pages
            .filter((page) => page.seo?.noIndex === "true")
            .map((page) => page.path),
        ),
      );
      store.clear();
      for (const entry of compiled) store.set(entry);
      await writeFile(
        new URL("../../public/blog-source.json", import.meta.url),
        JSON.stringify({
          mode: source.mode,
          snapshot: source.snapshot,
          releaseId: source.releaseId,
          fingerprint: sourceFingerprint(source),
          attachments: Object.fromEntries(
            source.attachments.map(({ entry }) => [
              entry.path,
              assets.get(entry.path.replace(/^\//, "")),
            ]),
          ),
          paths: (source.manifest ?? source.pages)
            .filter((entry) => entry.kind === "file")
            .map((entry) => entry.path)
            .sort(),
          builtAt: new Date().toISOString(),
        }),
      );
      logger.info(
        `Loaded ${compiled.length} published ${kind} entries from ${source.mode}`,
      );
    },
  };
}
