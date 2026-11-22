package io.edition.control.modules.objectstore.api;

import java.io.InputStream;
import java.time.Duration;
import java.time.Instant;
import java.util.Objects;
import java.util.Optional;

/** 内容寻址对象存储出口：键 = sha256(bytes)，同键即同内容，写入天然幂等。 */
public interface ObjectStoreApi {
    /** 同键已存在则跳过（内容寻址下等价）。依赖不可用抛 {@link Unavailable}。 */
    void putIfAbsent(String key, byte[] bytes, String contentType);

    /**
     * 流式写入；同键已存在则跳过且不消费 stream。{@code size} 未知时传 {@code -1}。
     * 依赖不可用抛 {@link Unavailable}。
     */
    void putIfAbsent(String key, InputStream stream, long size, String contentType);

    boolean exists(String key);

    /** GC only: caller holds object lock and has checked every reference. */
    void remove(String key);

    /**
     * 打开对象流；调用方必须关闭。键不存在返回 empty（供 sync 映射缺失的 uploadKey），
     * 传输/拒绝仍抛 {@link Unavailable}，不得把依赖故障降成 empty。
     */
    Optional<InputStream> open(String key);

    /** 短时签名下载地址；filename/contentType 落 Content-Disposition / Content-Type 响应头。 */
    PresignedGet presignGet(String key, Duration ttl, String filename, String contentType);

    /** 短时签名 PUT（浏览器直传）；不含 response-content-disposition。 */
    PresignedPut presignPut(String key, Duration ttl, String contentType);

    record PresignedGet(String url, Instant expiresAt) {
        public PresignedGet {
            Objects.requireNonNull(url, "url");
            Objects.requireNonNull(expiresAt, "expires at");
        }
    }

    record PresignedPut(String url, Instant expiresAt) {
        public PresignedPut {
            Objects.requireNonNull(url, "url");
            Objects.requireNonNull(expiresAt, "expires at");
        }
    }

    /** 对象存储不可用 / 超时 / 拒绝：瞬态依赖故障，调用方回滚事务并映射 503/504。 */
    final class Unavailable extends RuntimeException {
        public Unavailable(String message, Throwable cause) {
            super(message, cause);
        }
    }

    java.util.List<StoredObject> inventory(String after, int limit);

    record StoredObject(String key, Instant modifiedAt, long sizeBytes) {}
}
