package io.edition.control.usecases.authoring.pageediting;

import io.edition.control.modules.page.api.PageApi;
import java.util.Locale;

/** 页面列表 `q`：标题或该空间 slug 的包含匹配，不搜正文。 */
final class PageTitleSlugQuery {
    private PageTitleSlugQuery() {}

    /** strip 后空则不做过滤；界面展示的前导 `/` 不计入。 */
    static String needle(String q) {
        if (q == null) return null;
        String needle = q.strip();
        if (needle.startsWith("/")) needle = needle.substring(1).strip();
        return needle.isEmpty() ? null : needle;
    }

    static boolean matches(PageApi.View page, String slug, String needle) {
        return page != null && matches(page.title(), slug, needle);
    }

    static boolean matches(String title, String slug, String needle) {
        if (title == null || slug == null) return false;
        String n = needle.toLowerCase(Locale.ROOT);
        return title.toLowerCase(Locale.ROOT).contains(n)
                || slug.toLowerCase(Locale.ROOT).contains(n);
    }
}
