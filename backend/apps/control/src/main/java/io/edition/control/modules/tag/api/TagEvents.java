package io.edition.control.modules.tag.api;

import java.util.UUID;

/** 本概念事件：不点名 Page；消费者只按 itemId / label 协调。 */
public final class TagEvents {
    private TagEvents() {}

    public record Tagged(UUID itemId, String label) {}

    public record Untagged(UUID itemId, String label) {}

    public record Renamed(String from, String to) {}
}
