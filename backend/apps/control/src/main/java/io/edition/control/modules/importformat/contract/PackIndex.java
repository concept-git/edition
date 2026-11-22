package io.edition.control.modules.importformat.contract;

import io.edition.control.modules.importformat.api.*;
import java.util.Collection;
import java.util.List;
import java.util.Objects;

/** zip 中央目录的条目名（含目录项）；sniff 只读这个，不解压。 */
public record PackIndex(List<String> names) {
    public PackIndex {
        Objects.requireNonNull(names, "names");
        names = List.copyOf(names);
    }

    public static PackIndex of(Collection<String> names) {
        return new PackIndex(List.copyOf(names));
    }
}
