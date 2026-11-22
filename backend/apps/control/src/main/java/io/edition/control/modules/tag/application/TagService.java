package io.edition.control.modules.tag.application;

import io.edition.control.modules.tag.api.*;
import io.edition.control.modules.tag.api.TagApi;
import io.edition.control.modules.tag.api.TagEvents;
import io.edition.control.modules.tag.domain.TagBook;
import io.edition.control.modules.tag.domain.TagLabel;
import io.edition.control.modules.tag.domain.TagRepository;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** Tag 动作实现：归一化与单页上限在 domain；rename 合并由仓储两步 SQL 完成。 */
@Service
@Transactional
class TagService implements TagApi {
    private final TagRepository repository;
    private final ApplicationEventPublisher events;

    TagService(TagRepository repository, ApplicationEventPublisher events) {
        this.repository = repository;
        this.events = events;
    }

    @Override
    public TagResult tag(ItemId item, String label) {
        TagLabel parsed;
        try {
            parsed = new TagLabel(label);
        } catch (TagLabel.Invalid ignored) {
            return new TagResult.Invalid();
        }
        repository.lockVocabulary();
        Set<String> current = repository.labelsOf(item.value());
        return switch (TagBook.canAdd(current, parsed.value())) {
            case ALREADY -> new TagResult.Tagged();
            case TOO_MANY -> new TagResult.TooMany();
            case ADD -> {
                repository.insert(item.value(), parsed.value());
                events.publishEvent(new TagEvents.Tagged(item.value(), parsed.value()));
                yield new TagResult.Tagged();
            }
        };
    }

    @Override
    public UntagResult untag(ItemId item, String label) {
        TagLabel parsed;
        try {
            parsed = new TagLabel(label);
        } catch (TagLabel.Invalid ignored) {
            return new UntagResult.Invalid();
        }
        repository.lockVocabulary();
        repository.delete(item.value(), parsed.value());
        events.publishEvent(new TagEvents.Untagged(item.value(), parsed.value()));
        return new UntagResult.Untagged();
    }

    @Override
    public RenameResult rename(String from, String to) {
        TagLabel source;
        TagLabel target;
        try {
            source = new TagLabel(from);
            target = new TagLabel(to);
        } catch (TagLabel.Invalid ignored) {
            return new RenameResult.Invalid();
        }
        repository.lockVocabulary();
        if (!repository.exists(source.value())) return new RenameResult.NotFound();
        if (source.value().equals(target.value())) return new RenameResult.Renamed();
        repository.rename(source.value(), target.value());
        events.publishEvent(new TagEvents.Renamed(source.value(), target.value()));
        return new RenameResult.Renamed();
    }

    @Override
    @Transactional(readOnly = true)
    public Set<UUID> byLabel(String label) {
        try {
            return Set.copyOf(repository.byLabel(new TagLabel(label).value()));
        } catch (TagLabel.Invalid ignored) {
            return Set.of();
        }
    }

    @Override
    @Transactional(readOnly = true)
    public List<String> labelsOf(ItemId item) {
        return List.copyOf(repository.labelsOf(item.value())).stream().sorted().toList();
    }

    @Override
    @Transactional(readOnly = true)
    public Map<UUID, List<String>> labelsOf(Set<UUID> items) {
        if (items.isEmpty()) return Map.of();
        Map<UUID, List<String>> found = repository.labelsOf(items);
        Map<UUID, List<String>> ordered = new LinkedHashMap<>();
        for (UUID item : items) {
            List<String> labels = found.getOrDefault(item, List.of());
            ordered.put(item, labels.stream().sorted().toList());
        }
        return Map.copyOf(ordered);
    }

    @Override
    @Transactional(readOnly = true)
    public List<String> popular(int n) {
        if (n < 1) throw new IllegalArgumentException("n");
        return List.copyOf(repository.popular(n));
    }

    @Override
    @Transactional(readOnly = true)
    public List<Match> matching(String prefix) {
        String needle = prefix == null || prefix.isBlank() ? null : TagLabel.normalize(prefix);
        if (needle != null && !TagLabel.legal(needle)) return List.of();
        Map<String, List<UUID>> grouped = new LinkedHashMap<>();
        for (TagRepository.Row row : repository.matching(needle)) {
            grouped.computeIfAbsent(row.label(), ignored -> new ArrayList<>()).add(row.itemId());
        }
        return grouped.entrySet().stream()
                .map(entry -> new Match(entry.getKey(), entry.getValue()))
                .toList();
    }
}
