package io.edition.control.compositions.iam.team;

import java.text.Normalizer;
import java.util.Locale;

/** 幂等指纹用的 Team 名归一（NFKC + strip + 小写），与 TeamName 的唯一性归一保持一致。 */
final class TeamNames {
    private TeamNames() {}

    static String canonical(String value) {
        return value == null
                ? ""
                : Normalizer.normalize(value, Normalizer.Form.NFKC).strip().toLowerCase(Locale.ROOT);
    }
}
