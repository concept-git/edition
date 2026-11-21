package io.edition.concepts.importformat.routing;

import io.edition.concepts.importformat.api.*;
import io.edition.concepts.importformat.api.ImportFormatApi;
import io.edition.concepts.importformat.contract.AdaptSink;
import io.edition.concepts.importformat.contract.AdaptedPack;
import io.edition.concepts.importformat.contract.ImportFormatAdapter;
import io.edition.concepts.importformat.contract.PackIndex;
import io.edition.concepts.importformat.contract.PackSource;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;
import java.util.function.Predicate;
import org.springframework.stereotype.Component;

/** 统一格式路由：优先级只在此决定；拒绝与故障都保留已识别来源。 */
@Component
public class ImportFormatRegistry implements ImportFormatApi {
    private final List<ImportFormatAdapter> adapters;

    public ImportFormatRegistry(List<ImportFormatAdapter> adapters) {
        this.adapters = adapters.stream()
                .sorted(Comparator.comparingInt(ImportFormatAdapter::order).thenComparing(ImportFormatAdapter::id))
                .toList();
    }

    @Override
    public Optional<String> sniff(PackIndex index) {
        return select(adapter -> adapter.sniff(index)).map(ImportFormatAdapter::id);
    }

    @Override
    public Optional<String> sniff(PackIndex index, PackSource source) {
        return select(adapter -> adapter.sniff(index, source)).map(ImportFormatAdapter::id);
    }

    private Optional<ImportFormatAdapter> select(Predicate<ImportFormatAdapter> matches) {
        return adapters.stream().filter(matches).findFirst();
    }

    @Override
    public Result adapt(PackIndex index, PackSource source, AdaptSink sink) {
        if (source.hasZipSlip()) {
            String path = source.zipSlipEntries().isEmpty()
                    ? null
                    : source.zipSlipEntries().getFirst();
            return new Result.Invalid(
                    null, List.of(new AdaptedPack.Issue("zip_slip", path, "entry escapes pack root")));
        }
        ImportFormatAdapter adapter =
                select(candidate -> candidate.sniff(index, source)).orElse(null);
        if (adapter == null) return new Result.UnknownFormat();
        ImportFormatAdapter.Outcome outcome;
        try {
            // 命中格式后的拒绝直接返回，绝不降级成其他格式重新导入。
            outcome = adapter.adapt(new FormatMetadataSource(source, adapters), sink);
        } catch (AdaptSink.TooLarge tooLarge) {
            return new Result.Invalid(
                    adapter.id(), List.of(new AdaptedPack.Issue("file_too_large", tooLarge.getMessage(), null)));
        }
        return switch (outcome) {
            case ImportFormatAdapter.Outcome.Adapted adapted -> {
                var identities = new java.util.HashSet<String>();
                var conflicts = new java.util.ArrayList<AdaptedPack.Issue>();
                for (var page : adapted.pack().pages()) {
                    if (page.externalId() != null && !identities.add(page.externalId())) {
                        conflicts.add(new AdaptedPack.Issue(
                                "duplicate_external_id", "pages[].externalId", page.externalId()));
                    }
                }
                yield conflicts.isEmpty()
                        ? new Result.Adapted(adapter.id(), adapted.pack())
                        : new Result.Invalid(adapter.id(), List.copyOf(conflicts));
            }
            case ImportFormatAdapter.Outcome.Invalid invalid -> new Result.Invalid(adapter.id(), invalid.issues());
        };
    }
}
