// site 的公开契约：其他 feature 只能从这里取用。
export type {
  NavNode,
  Site,
  SiteOutcome,
  SiteRepository,
  SpaceInfo,
} from "./domain/site.ts";
export {
  analyticsIdOf,
  defaultPrimaryColor,
  findSpace,
  languageOf,
  pageLinks,
  safeColor,
  sectionTrail,
  siteNoIndex,
  titleFor,
} from "./domain/site.ts";
