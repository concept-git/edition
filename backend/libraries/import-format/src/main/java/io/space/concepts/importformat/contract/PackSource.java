package io.space.concepts.importformat.contract;

import io.space.concepts.importformat.api.*;
import java.io.IOException;
import java.io.InputStream;
import java.util.List;

/** 打开 zip 条目流。调用方拥有生命周期；条目名必须来自 {@link #index()}。 */
public interface PackSource extends AutoCloseable {
    PackIndex index();

    InputStream open(String name) throws IOException;

    /** 路由层识别的元数据仍可读取，但不作为未引用附件扫描。 */
    default boolean metadataEntry(String name) {
        return false;
    }

    default long size(String name) {
        return -1;
    }

    default boolean hasZipSlip() {
        return !zipSlipEntries().isEmpty();
    }

    default List<String> zipSlipEntries() {
        return List.of();
    }

    @Override
    default void close() throws IOException {}
}
