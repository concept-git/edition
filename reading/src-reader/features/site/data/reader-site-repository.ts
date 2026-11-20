import { failureFrom, unreachable } from "../../../shared/http/failure.ts";
import type { ForwardContext } from "../../../shared/http/forward.ts";
import type { ReaderClient } from "../../../shared/http/reader-client.ts";
import { safeUrl } from "../../../shared/url/paths.ts";
import type {
  NavNode,
  Site,
  SiteOutcome,
  SiteRepository,
} from "../domain/site.ts";

const str = (value: unknown): string | null =>
  typeof value === "string" && value ? value : null;

function node(raw: any): NavNode {
  return {
    label: str(raw?.label) ?? "",
    kind: str(raw?.kind) ?? "page",
    href: safeUrl(raw?.href),
    pageId: str(raw?.pageId),
    children: Array.isArray(raw?.children) ? raw.children.map(node) : [],
  };
}

export function mapSite(raw: any): Site {
  return {
    name: str(raw?.name) ?? "Space",
    logo: safeUrl(raw?.logo),
    favicon: safeUrl(raw?.favicon),
    primaryColor: str(raw?.primaryColor),
    locale: str(raw?.locale),
    titleTemplate: str(raw?.titleTemplate),
    analyticsId: str(raw?.analyticsId),
    robotsPolicy: str(raw?.robotsPolicy),
    primaryHost: str(raw?.primaryHost),
    home: str(raw?.home),
    spaces: Array.isArray(raw?.spaces)
      ? raw.spaces.map((space: any) => ({
          slug: str(space?.slug) ?? "",
          name: str(space?.name) ?? "",
          navigation: Array.isArray(space?.navigation)
            ? space.navigation.map(node)
            : [],
        }))
      : [],
  };
}

export function createReaderSiteRepository(
  client: ReaderClient,
  context: ForwardContext,
): SiteRepository {
  return {
    async read(): Promise<SiteOutcome> {
      try {
        const response = await client.get("/api/content/site", context);
        if (response.status === 200)
          return { kind: "site", site: mapSite(await response.json()) };
        return await failureFrom(response);
      } catch (error) {
        const failure = unreachable(error);
        if (failure) return failure;
        throw error;
      }
    },
  };
}
