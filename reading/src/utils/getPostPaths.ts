import { getRelativeLocaleUrl } from "astro:i18n";
import config from "@/config";
export function getPostSlug(id: string, _filePath?: string) {
  return id.replace(/^\/+|\/+$/g, "");
}
export function getPostUrl(
  id: string,
  _filePath?: string,
  locale = config.site.lang,
) {
  return getRelativeLocaleUrl(locale, getPostSlug(id));
}
