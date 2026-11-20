package io.space.concepts.importformat.api;

import io.space.concepts.importformat.contract.AdaptSink;
import io.space.concepts.importformat.contract.AdaptedPack;
import io.space.concepts.importformat.contract.PackIndex;
import io.space.concepts.importformat.contract.PackSource;
import java.util.List;
import java.util.Optional;

/** 导入包格式出口：中央目录 sniff，再流式 adapt。零命中为 {@link Result.UnknownFormat}。 */
public interface ImportFormatApi {
    Optional<String> sniff(PackIndex index);

    Optional<String> sniff(PackIndex index, PackSource source);

    Result adapt(PackIndex index, PackSource source, AdaptSink sink);

    sealed interface Result {
        record Adapted(String adapterId, AdaptedPack pack) implements Result {}

        record Invalid(String adapterId, List<AdaptedPack.Issue> issues) implements Result {}

        record UnknownFormat() implements Result {}
    }
}
