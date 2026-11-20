package io.space.content;

import java.nio.charset.StandardCharsets;
import java.util.Objects;

/** A space-relative file address. Its spelling is also the published URL path. */
public record ResourcePath(String value) {
    public ResourcePath {
        Objects.requireNonNull(value, "resource path");
        if (value.isEmpty() || value.length() > 2048 || value.startsWith("/") || value.endsWith("/")) {
            throw new IllegalArgumentException("invalid resource path");
        }
        for (int i = 0; i < value.length(); i++) {
            char c = value.charAt(i);
            if (Character.isISOControl(c) || c == '\\') {
                throw new IllegalArgumentException("invalid resource path");
            }
        }
        for (String segment : value.split("/", -1)) {
            if (segment.isBlank()
                    || segment.equals(".")
                    || segment.equals("..")
                    || segment.getBytes(StandardCharsets.UTF_8).length > 255) {
                throw new IllegalArgumentException("invalid resource path");
            }
        }
    }

    public boolean conflictsWith(ResourcePath other) {
        return value.equals(other.value) || value.startsWith(other.value + "/") || other.value.startsWith(value + "/");
    }
}
