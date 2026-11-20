package io.space.control.compositions.releases.release;

/** 无 live 的 skip/promote 组合，避免 Jackson `_live` 0..1 绑死第一个主版本。 */
public final class ReleaseDecisions {
    private ReleaseDecisions() {}

    public static boolean skip(boolean hasLive, int pageCount, boolean pagesUnchanged, boolean tocUnchanged) {
        if (!hasLive) return pageCount == 0;
        return pagesUnchanged && tocUnchanged;
    }
}
