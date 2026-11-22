package io.edition.control.modules.importformat.archive;

import io.edition.control.modules.importformat.api.*;

/** 包内路径与安全规则；不认识任何来源格式。 */
public final class PackPaths {
    private PackPaths() {}

    public static String unix(String name) {
        return name == null ? "" : name.replace('\\', '/');
    }

    public static String basename(String name) {
        String unix = unix(name);
        int slash = unix.lastIndexOf('/');
        return slash < 0 ? unix : unix.substring(slash + 1);
    }

    public static String parent(String name) {
        String unix = unix(name);
        int slash = unix.lastIndexOf('/');
        return slash < 0 ? "" : unix.substring(0, slash);
    }

    public static boolean directory(String name) {
        return unix(name).endsWith("/");
    }

    public static boolean zipSlip(String name) {
        String unix = unix(name);
        if (unix.isBlank()) return true;
        if (unix.startsWith("/") || unix.startsWith("\\")) return true;
        if (unix.length() >= 2 && Character.isLetter(unix.charAt(0)) && unix.charAt(1) == ':') return true;
        for (String part : unix.split("/")) {
            if ("..".equals(part)) return true;
        }
        return false;
    }

    public static boolean discarded(String name) {
        String unix = unix(name);
        String base = basename(unix);
        if (unix.equals("__MACOSX") || unix.startsWith("__MACOSX/") || unix.contains("/__MACOSX/")) return true;
        if (base.startsWith("._")) return true;
        if (base.equals(".DS_Store")) return true;
        return false;
    }

    public static String stripExtension(String name) {
        String base = basename(name);
        int dot = base.lastIndexOf('.');
        return dot > 0 ? base.substring(0, dot) : base;
    }

    /**
     * GitHub zipball / 整目录打包时，全部有效条目同属一个顶层目录、根下没有文件。
     * 返回带尾斜杠的前缀；否则 null（例如 F-okf-mini 根上就有 {@code .okfignore}）。
     */
    public static String wrapperPrefix(Iterable<String> names) {
        String prefix = null;
        boolean any = false;
        for (String name : names) {
            if (zipSlip(name) || discarded(name)) continue;
            String path = unix(name);
            if (path.isEmpty()) continue;
            int slash = path.indexOf('/');
            if (slash < 0) return null;
            String top = path.substring(0, slash + 1);
            if (prefix == null) prefix = top;
            else if (!prefix.equals(top)) return null;
            any = true;
        }
        return any ? prefix : null;
    }

    public static String stripWrapper(String name, String prefix) {
        String path = unix(name);
        if (prefix == null || prefix.isEmpty() || !path.startsWith(prefix)) return path;
        return path.substring(prefix.length());
    }
}
