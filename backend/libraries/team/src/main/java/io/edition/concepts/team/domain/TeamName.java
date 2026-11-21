package io.edition.concepts.team.domain;

import io.edition.concepts.team.api.*;
import java.text.Normalizer;
import java.util.Locale;
import java.util.Optional;

/** 同一名称同时保留 NFKC 展示值与 ROOT 小写比较键，唯一性不受服务器语言环境影响。 */
public record TeamName(String display, String normalized) {

    public static Optional<TeamName> parse(String candidate) {
        if (candidate == null) return Optional.empty();
        var display = Normalizer.normalize(candidate, Normalizer.Form.NFKC).strip();
        if (display.isEmpty() || display.length() > 120) return Optional.empty();
        return Optional.of(new TeamName(display, display.toLowerCase(Locale.ROOT)));
    }
}
