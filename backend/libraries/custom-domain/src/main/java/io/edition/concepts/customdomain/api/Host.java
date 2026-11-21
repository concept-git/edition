package io.edition.concepts.customdomain.api;

import java.net.IDN;
import java.util.Locale;
import java.util.Objects;
import java.util.regex.Pattern;

/** 恰好一个 FQDN：小写 ASCII / punycode，无通配、端口、scheme、尾点。 */
public record Host(String value) {
    private static final int MAX_LENGTH = 253;
    private static final Pattern LABEL = Pattern.compile("[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?");

    public Host {
        Objects.requireNonNull(value, "host");
        value = normalize(value);
    }

    public static String normalize(String raw) {
        String stripped = raw.strip();
        if (stripped.isEmpty()
                || stripped.endsWith(".")
                || stripped.contains(":")
                || stripped.contains("/")
                || stripped.contains("*")
                || stripped.contains(" ")
                || stripped.contains("_")) {
            throw new Invalid();
        }
        final String ascii;
        try {
            ascii = IDN.toASCII(stripped, IDN.USE_STD3_ASCII_RULES).toLowerCase(Locale.ROOT);
        } catch (IllegalArgumentException invalid) {
            throw new Invalid();
        }
        if (ascii.isEmpty() || ascii.length() > MAX_LENGTH || ascii.endsWith(".") || !ascii.contains(".")) {
            throw new Invalid();
        }
        String[] labels = ascii.split("\\.");
        if (labels.length < 2) throw new Invalid();
        for (String label : labels) {
            if (label.isEmpty() || label.length() > 63 || !LABEL.matcher(label).matches()) {
                throw new Invalid();
            }
        }
        return ascii;
    }

    public static final class Invalid extends RuntimeException {}
}
