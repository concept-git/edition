package io.space.concepts.importformat.formats.filetree;

import io.space.concepts.importformat.api.*;
import io.space.concepts.importformat.archive.PackFiles;
import io.space.concepts.importformat.archive.PackPaths;
import io.space.concepts.importformat.contract.PackIndex;
import java.util.Locale;

/** 普通目录的选页策略；其他格式不继承仓库样板排除规则。 */
final class FileTreeSelection {
    private FileTreeSelection() {}

    /** 代码仓库惯用的非文档文件：file-tree 不当页，跳过并 info。 */
    static boolean repositoryBoilerplate(String name) {
        String unix = PackPaths.unix(name);
        for (String part : unix.split("/")) {
            if (part.length() > 1 && part.startsWith(".")) return true;
        }
        String base = PackPaths.basename(unix).toUpperCase(Locale.ROOT);
        return base.startsWith("LICENSE")
                || base.startsWith("LICENCE")
                || base.startsWith("CHANGELOG")
                || base.startsWith("CONTRIBUTING")
                || base.startsWith("CODE_OF_CONDUCT")
                || base.equals("SECURITY.MD");
    }

    /** file-tree 可成页的文本文件，且不是丢弃项或仓库样板。 */
    static boolean pageCandidate(String name) {
        if (PackPaths.directory(name) || PackPaths.discarded(name) || PackPaths.zipSlip(name)) return false;
        if (repositoryBoilerplate(name)) return false;
        return PackFiles.page(name);
    }

    static boolean anyPageCandidate(PackIndex index) {
        for (String name : index.names()) {
            if (pageCandidate(name)) return true;
        }
        return false;
    }
}
