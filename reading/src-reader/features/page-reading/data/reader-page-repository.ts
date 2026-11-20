import { failureFrom, unreachable } from "../../../shared/http/failure.ts";
import type { ForwardContext } from "../../../shared/http/forward.ts";
import type { ReaderClient } from "../../../shared/http/reader-client.ts";
import { encodePathSegments } from "../../../shared/url/paths.ts";
import type { PageData, PageOutcome, PageRepository } from "../domain/page.ts";

const str = (value: unknown, fallback = ""): string =>
  typeof value === "string" ? value : fallback;

function record(value: unknown): Record<string, string> {
  if (!value || typeof value !== "object") return {};
  return Object.fromEntries(
    Object.entries(value).filter(([, item]) => typeof item === "string"),
  ) as Record<string, string>;
}

export function mapPage(raw: any): PageData {
  return {
    id: str(raw?.id),
    path: str(raw?.path),
    title: str(raw?.title),
    format: str(raw?.format, "markdown"),
    content: str(raw?.content),
    contentHash: str(raw?.contentHash),
    space: str(raw?.space),
    spaceName: str(raw?.spaceName),
    snapshot: str(raw?.snapshot),
    seo: record(raw?.seo),
    properties: record(raw?.properties),
    attachments: Array.isArray(raw?.attachments)
      ? raw.attachments
          .filter((item: any) => typeof item?.path === "string")
          .map((item: any) => ({ path: item.path as string }))
      : [],
    promotedAt: typeof raw?.promotedAt === "string" ? raw.promotedAt : null,
    renderHost:
      typeof raw?.contentTypeDefinition?.definition?.renderHost === "string"
        ? raw.contentTypeDefinition.definition.renderHost
        : null,
    contentType:
      typeof raw?.contentProfile?.contentType === "string"
        ? raw.contentProfile.contentType
        : null,
    interpretation:
      raw?.contentProfile?.interpretation &&
      typeof raw.contentProfile.interpretation === "object" &&
      !Array.isArray(raw.contentProfile.interpretation)
        ? raw.contentProfile.interpretation
        : {},
    contentDefinition: raw?.contentTypeDefinition ?? null,
  };
}

export function createReaderPageRepository(
  client: ReaderClient,
  context: ForwardContext,
): PageRepository {
  return {
    async read(path: string): Promise<PageOutcome> {
      const apiPath =
        path === "/"
          ? "/api/content/pages"
          : `/api/content/pages/${encodePathSegments(path.replace(/^\//, ""))}`;
      try {
        const response = await client.get(apiPath, context);
        const location = response.headers.get("location");
        switch (response.status) {
          case 200:
            return { kind: "page", page: mapPage(await response.json()) };
          case 301:
          case 302:
            if (location)
              return { kind: "redirect", status: response.status, location };
            break;
          case 303:
            if (location) return { kind: "attachment", location };
            break;
        }
        // 304 不会出现：我们不发 If-None-Match。其余意外状态按不可用处理。
        return await failureFrom(
          response.status === 401 ||
            response.status === 403 ||
            response.status === 404 ||
            response.status === 422 ||
            response.status === 503
            ? response
            : new Response(null, { status: 502 }),
        );
      } catch (error) {
        const failure = unreachable(error);
        if (failure) return failure;
        throw error;
      }
    },
  };
}
