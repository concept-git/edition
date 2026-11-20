package io.space.concepts.release.api;

import io.space.shared.Sha256;
import java.nio.charset.StandardCharsets;

/** SHA-256 of UTF-8 bytes. DB stores lowercase hex; Bundle checksums use the sha256: prefix. */
public final class ContentHash {
    private ContentHash() {}

    public static String hex(String body) {
        return hex(body == null ? new byte[0] : body.getBytes(StandardCharsets.UTF_8));
    }

    public static String hex(byte[] bytes) {
        return Sha256.hex(bytes);
    }

    public static String checksum(String body) {
        return "sha256:" + hex(body);
    }

    public static String stripPrefix(String checksum) {
        if (checksum != null && checksum.startsWith("sha256:")) return checksum.substring("sha256:".length());
        return checksum;
    }
}
