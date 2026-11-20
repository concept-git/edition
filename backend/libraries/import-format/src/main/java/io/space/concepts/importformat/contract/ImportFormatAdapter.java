package io.space.concepts.importformat.contract;

import io.space.concepts.importformat.api.*;
import java.util.List;

/** 一种导入包格式。新格式加 {@code @Component} 实现，不必改 sync。 */
public interface ImportFormatAdapter {
    String id();

    int order();

    /** 声明本格式的元数据文件；路由层聚合声明，附件扫描无需认识具体格式。 */
    default boolean metadataEntry(String name) {
        return false;
    }

    boolean sniff(PackIndex index);

    default boolean sniff(PackIndex index, PackSource source) {
        return sniff(index);
    }

    Outcome adapt(PackSource source, AdaptSink sink);

    sealed interface Outcome {
        record Adapted(AdaptedPack pack) implements Outcome {}

        record Invalid(List<AdaptedPack.Issue> issues) implements Outcome {}
    }
}
