package io.edition.control.modules.importformat.attachments;

import io.edition.control.modules.importformat.api.*;
import io.edition.control.modules.importformat.contract.AdaptSink;
import io.edition.control.modules.importformat.contract.ImportLimits;
import io.edition.shared.Sha256;
import java.nio.charset.StandardCharsets;
import java.util.Arrays;

/**
 * 附件类型按文件头嗅探（不信任声明），storageKey = sha256(bytes)。
 * 白名单 = png / jpeg / gif / webp / pdf；SVG 可携带脚本，有意排除。
 * 从 Page.AttachmentFile 复制，本模块不得依赖 concept.authoring.page。
 */
public final class AttachmentTypes {
    private static final byte[] PNG = {(byte) 0x89, 'P', 'N', 'G', 0x0D, 0x0A, 0x1A, 0x0A};
    private static final byte[] JPEG = {(byte) 0xFF, (byte) 0xD8, (byte) 0xFF};
    private static final byte[] GIF87 = "GIF87a".getBytes(StandardCharsets.US_ASCII);
    private static final byte[] GIF89 = "GIF89a".getBytes(StandardCharsets.US_ASCII);
    private static final byte[] RIFF = "RIFF".getBytes(StandardCharsets.US_ASCII);
    private static final byte[] WEBP = "WEBP".getBytes(StandardCharsets.US_ASCII);
    private static final byte[] PDF = "%PDF-".getBytes(StandardCharsets.US_ASCII);

    private AttachmentTypes() {}

    public static String sniff(byte[] bytes) {
        if (startsWith(bytes, 0, PNG)) return "image/png";
        if (startsWith(bytes, 0, JPEG)) return "image/jpeg";
        if (startsWith(bytes, 0, GIF87) || startsWith(bytes, 0, GIF89)) return "image/gif";
        if (startsWith(bytes, 0, RIFF) && startsWith(bytes, 8, WEBP)) return "image/webp";
        if (startsWith(bytes, 0, PDF)) return "application/pdf";
        return null;
    }

    public static AdaptSink.StoredAttachment inspect(String logicalPath, byte[] bytes) {
        if (bytes.length > ImportLimits.MAX_ATTACHMENT_BYTES) throw new AdaptSink.TooLarge(logicalPath);
        String mime = sniff(bytes);
        if (mime == null) throw new AdaptSink.UnsupportedType(logicalPath);
        String digest = Sha256.hex(bytes);
        return new AdaptSink.StoredAttachment(digest, digest, mime, bytes.length);
    }

    private static boolean startsWith(byte[] bytes, int offset, byte[] prefix) {
        if (bytes.length < offset + prefix.length) return false;
        return Arrays.equals(bytes, offset, offset + prefix.length, prefix, 0, prefix.length);
    }
}
