package io.edition.concepts.page.domain;

import io.edition.concepts.page.api.*;
import io.edition.concepts.page.api.PageApi;
import io.edition.shared.Sha256;
import java.nio.charset.StandardCharsets;
import java.util.Arrays;
import java.util.Objects;

/**
 * 通过校验的上传文件：类型按文件头嗅探（不信任声明），storageKey = sha256(bytes)。
 * 白名单 = png / jpeg / gif / webp / pdf；SVG 可携带脚本，有意排除。
 */
public record AttachmentFile(String filename, String mime, long sizeBytes, String storageKey) {
    private static final int MAX_FILENAME_CODE_POINTS = 255;
    private static final byte[] PNG = {(byte) 0x89, 'P', 'N', 'G', 0x0D, 0x0A, 0x1A, 0x0A};
    private static final byte[] JPEG = {(byte) 0xFF, (byte) 0xD8, (byte) 0xFF};
    private static final byte[] GIF87 = "GIF87a".getBytes(StandardCharsets.US_ASCII);
    private static final byte[] GIF89 = "GIF89a".getBytes(StandardCharsets.US_ASCII);
    private static final byte[] RIFF = "RIFF".getBytes(StandardCharsets.US_ASCII);
    private static final byte[] WEBP = "WEBP".getBytes(StandardCharsets.US_ASCII);
    private static final byte[] PDF = "%PDF-".getBytes(StandardCharsets.US_ASCII);

    public AttachmentFile {
        Objects.requireNonNull(filename, "filename");
        Objects.requireNonNull(mime, "mime");
        Objects.requireNonNull(storageKey, "storage key");
    }

    public static AttachmentFile inspect(PageApi.FileUpload upload) {
        String filename = requireFilename(upload.filename());
        byte[] bytes = upload.bytes();
        if (bytes.length > PageApi.MAX_ATTACHMENT_BYTES) throw new FileTooLarge();
        String mime = sniff(bytes);
        if (mime == null) throw new FileTypeUnsupported();
        return new AttachmentFile(filename, mime, bytes.length, sha256(bytes));
    }

    private static String requireFilename(String value) {
        String name = value.strip();
        int length = name.codePointCount(0, name.length());
        if (length < 1 || length > MAX_FILENAME_CODE_POINTS) throw new FilenameInvalid();
        if (name.indexOf('/') >= 0 || name.indexOf('\\') >= 0 || name.indexOf('\0') >= 0) {
            throw new FilenameInvalid();
        }
        return name;
    }

    private static String sniff(byte[] bytes) {
        if (startsWith(bytes, 0, PNG)) return "image/png";
        if (startsWith(bytes, 0, JPEG)) return "image/jpeg";
        if (startsWith(bytes, 0, GIF87) || startsWith(bytes, 0, GIF89)) return "image/gif";
        if (startsWith(bytes, 0, RIFF) && startsWith(bytes, 8, WEBP)) return "image/webp";
        if (startsWith(bytes, 0, PDF)) return "application/pdf";
        return null;
    }

    private static boolean startsWith(byte[] bytes, int offset, byte[] prefix) {
        if (bytes.length < offset + prefix.length) return false;
        return Arrays.equals(bytes, offset, offset + prefix.length, prefix, 0, prefix.length);
    }

    public static String sha256(byte[] bytes) {
        return Sha256.hex(bytes);
    }

    public static final class FileTooLarge extends RuntimeException {}

    public static final class FileTypeUnsupported extends RuntimeException {}

    public static final class FilenameInvalid extends RuntimeException {}
}
