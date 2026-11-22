package io.edition.control.modules.importformat.contract;

import io.edition.control.modules.importformat.api.*;
import java.io.InputStream;
import java.util.List;
import java.util.Objects;

/**
 * 流式附件落点。生产 sync 将包 ObjectStore；本模块测试用内存实现。
 * sink 必须哈希流；附件 ≤10 MiB 所以可以缓冲。超限或魔数不在白名单时抛本接口的拒绝异常。
 */
public interface AdaptSink {
    StoredAttachment putAttachment(String logicalPath, InputStream in, long size);

    void info(String code, String path, String detail);

    default List<AdaptedPack.Issue> issues() {
        return List.of();
    }

    record StoredAttachment(String sha256, String storageKey, String mime, long size) {
        public StoredAttachment {
            Objects.requireNonNull(sha256, "sha256");
            Objects.requireNonNull(storageKey, "storage key");
            Objects.requireNonNull(mime, "mime");
        }
    }

    final class TooLarge extends RuntimeException {
        public TooLarge(String path) {
            super(path);
        }
    }

    final class UnsupportedType extends RuntimeException {
        public UnsupportedType(String path) {
            super(path);
        }
    }
}
