package io.edition.control.modules.importformat.archive;

import io.edition.control.modules.importformat.api.*;
import io.edition.control.modules.importformat.contract.PackSource;
import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.util.Locale;

/** Bounded zip-entry reads and checksum comparison. */
public final class PackIo {
    private PackIo() {}

    public static byte[] readLimited(PackSource source, String name, int max) throws IOException {
        long declared = source.size(name);
        if (declared > max) return null;
        try (InputStream in = source.open(name)) {
            byte[] data = in.readNBytes(max + 1);
            if (data.length > max) return null;
            return data;
        }
    }

    public static String utf8Limited(PackSource source, String name, int max) throws IOException {
        byte[] data = readLimited(source, name, max);
        return data == null
                ? null
                : StandardCharsets.UTF_8
                        .newDecoder()
                        .onMalformedInput(java.nio.charset.CodingErrorAction.REPORT)
                        .onUnmappableCharacter(java.nio.charset.CodingErrorAction.REPORT)
                        .decode(java.nio.ByteBuffer.wrap(data))
                        .toString();
    }

    public static String normalizeChecksum(String value) {
        if (value == null) return null;
        String hex = value.startsWith("sha256:") ? value.substring("sha256:".length()) : value;
        return hex.toLowerCase(Locale.ROOT);
    }

    public static boolean checksumMatches(String expected, String actualHex) {
        String want = normalizeChecksum(expected);
        String got = normalizeChecksum(actualHex);
        return want != null && want.equals(got);
    }
}
