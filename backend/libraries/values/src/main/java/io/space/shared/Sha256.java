package io.space.shared;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.HexFormat;

/** SHA-256 的唯一构造入口；每次创建独立实例，供正文、凭据及流式文件摘要复用。 */
public final class Sha256 {
    private Sha256() {}

    /** 流式调用方自行 update/digest；实例有状态，不能跨线程或跨摘要复用。 */
    public static MessageDigest newDigest() {
        try {
            return MessageDigest.getInstance("SHA-256");
        } catch (NoSuchAlgorithmException impossible) {
            throw new IllegalStateException("SHA-256 unavailable", impossible);
        }
    }

    public static byte[] digest(byte[] bytes) {
        return newDigest().digest(bytes);
    }

    public static String hex(byte[] bytes) {
        return HexFormat.of().formatHex(digest(bytes));
    }

    /** 文本摘要固定使用 UTF-8；不在摘要层更改大小写、空白或空值语义。 */
    public static String hex(String text) {
        return hex(text.getBytes(StandardCharsets.UTF_8));
    }
}
