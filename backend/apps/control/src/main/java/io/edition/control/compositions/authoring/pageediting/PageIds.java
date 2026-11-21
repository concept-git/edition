package io.edition.control.compositions.authoring.pageediting;

import static io.edition.control.compositions.authoring.pageediting.PageEditingTypes.*;

import java.util.List;
import java.util.Set;
import java.util.UUID;

/** Shared entry policy or read projection; no independent causal invocation. */
final class PageIds {

    private PageIds() {}

    static void requireIds(List<UUID> ids) {
        if (ids == null || ids.isEmpty() || ids.size() > 100 || ids.contains(null))
            throw new MetadataInvalidException("ids", "invalid_size");
        if (Set.copyOf(ids).size() != ids.size()) throw new MetadataInvalidException("ids", "duplicate");
    }
}
