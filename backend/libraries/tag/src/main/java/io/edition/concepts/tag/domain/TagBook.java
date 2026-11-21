package io.edition.concepts.tag.domain;

import io.edition.concepts.tag.api.*;
import java.util.Set;

/** 单页标签集的上限：已有该词则幂等；满 50 且为新词则拒绝。 */
public final class TagBook {
    public static final int MAX_LABELS = 50;

    private TagBook() {}

    public static Outcome canAdd(Set<String> current, String label) {
        if (current.contains(label)) return Outcome.ALREADY;
        if (current.size() >= MAX_LABELS) return Outcome.TOO_MANY;
        return Outcome.ADD;
    }

    public enum Outcome {
        ALREADY,
        ADD,
        TOO_MANY
    }
}
