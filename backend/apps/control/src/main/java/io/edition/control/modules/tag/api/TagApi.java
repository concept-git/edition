package io.edition.control.modules.tag.api;

import io.edition.control.modules.tag.domain.TagLabel;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

/**
 * Tag 概念唯一出口；Item 在本概念只是 UUID，页面归属由 sync 核对。
 * 有限结果类型，不抛 HTTP。
 */
public interface TagApi {
    int MAX_LABEL_CODE_POINTS = 64;
    int MAX_LABELS_PER_ITEM = 50;

    TagResult tag(ItemId item, String label);

    UntagResult untag(ItemId item, String label);

    RenameResult rename(String from, String to);

    Set<UUID> byLabel(String label);

    List<String> labelsOf(ItemId item);

    Map<UUID, List<String>> labelsOf(Set<UUID> items);

    List<String> popular(int n);

    List<Match> matching(String prefix);

    /** 归一化成功返回词；blank/非法返回 empty。供 sync 翻译 validation_failed，不暴露 domain。 */
    static Optional<String> parse(String raw) {
        if (raw == null || raw.isBlank()) return Optional.empty();
        try {
            return Optional.of(new TagLabel(raw).value());
        } catch (TagLabel.Invalid ignored) {
            return Optional.empty();
        }
    }

    record ItemId(UUID value) {
        public ItemId {
            Objects.requireNonNull(value, "item id");
        }
    }

    record Match(String label, List<UUID> items) {
        public Match {
            items = List.copyOf(items);
        }
    }

    sealed interface TagResult {
        record Tagged() implements TagResult {}

        record TooMany() implements TagResult {}

        record Invalid() implements TagResult {}
    }

    sealed interface UntagResult {
        record Untagged() implements UntagResult {}

        record Invalid() implements UntagResult {}
    }

    sealed interface RenameResult {
        record Renamed() implements RenameResult {}

        record NotFound() implements RenameResult {}

        record Invalid() implements RenameResult {}
    }
}
