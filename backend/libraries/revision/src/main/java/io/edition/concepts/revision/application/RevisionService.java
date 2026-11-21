package io.edition.concepts.revision.application;

import io.edition.concepts.revision.api.*;
import io.edition.concepts.revision.api.RevisionApi;
import io.edition.concepts.revision.domain.RevisionDiff;
import io.edition.concepts.revision.domain.RevisionRepository;
import io.edition.shared.PageWindow;
import io.edition.shared.Sha256;
import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.Optional;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
class RevisionService implements RevisionApi {
    private final RevisionRepository repository;

    RevisionService(RevisionRepository repository) {
        this.repository = repository;
    }

    @Override
    public Entry record(ItemId item, int n, String content, Actor actor, String note) {
        return record(item, n, content, actor, note, null);
    }

    @Override
    public Entry record(
            ItemId item, int n, String content, Actor actor, String note, io.edition.content.ContentProfile profile) {
        repository.lock(item);
        var latest = repository.latest(item);
        int expected = latest.map(value -> value.n() + 1).orElse(1);
        if (n != expected) {
            throw new IllegalStateException("revision sequence diverged: expected " + expected + " but received " + n);
        }
        var stored = repository.insert(item, n, content, Sha256.hex(content), actor, note, profile);
        long previous = latest.map(RevisionRepository.Stored::sizeBytes).orElse(0L);
        return entry(stored, stored.sizeBytes() - previous);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<Detail> detail(ItemId item, int n) {
        return repository
                .find(item, n)
                .map(value ->
                        new Detail(entry(value, sizeDelta(item, value)), value.content(), value.contentProfile()));
    }

    @Override
    @Transactional(readOnly = true)
    public Page page(ItemId item, String cursor, int limit) {
        if (limit < 1 || limit > 100) throw new IllegalArgumentException("limit must be between 1 and 100");
        Integer before = decode(cursor);
        var rows = repository.page(item, before, limit + 1);
        var window = PageWindow.of(rows, limit, row -> encode(row.n()));
        return new Page(window.items(), window.nextCursor());
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<Diff> diff(ItemId item, int from, int to) {
        var before = repository.find(item, from);
        var after = repository.find(item, to);
        if (before.isEmpty() || after.isEmpty()) return Optional.empty();
        return Optional.of(RevisionDiff.between(
                from, before.orElseThrow().content(), to, after.orElseThrow().content()));
    }

    @Override
    @Transactional(readOnly = true)
    public long count(ItemId item) {
        return repository.count(item);
    }

    private long sizeDelta(ItemId item, RevisionRepository.Stored value) {
        return value.sizeBytes()
                - repository
                        .find(item, value.n() - 1)
                        .map(RevisionRepository.Stored::sizeBytes)
                        .orElse(0L);
    }

    private static Entry entry(RevisionRepository.Stored value, long sizeDelta) {
        return new Entry(value.n(), value.actor(), value.createdAt(), value.note(), value.sizeBytes(), sizeDelta);
    }

    private static String encode(int value) {
        return Base64.getUrlEncoder()
                .withoutPadding()
                .encodeToString(Integer.toString(value).getBytes(StandardCharsets.UTF_8));
    }

    private static Integer decode(String value) {
        if (value == null || value.isBlank()) return null;
        try {
            return Integer.parseInt(new String(Base64.getUrlDecoder().decode(value), StandardCharsets.UTF_8));
        } catch (IllegalArgumentException invalid) {
            throw new IllegalArgumentException("invalid revision cursor", invalid);
        }
    }

    @Override
    public void prune(ItemId item, int keep) {
        if (keep < 0) throw new IllegalArgumentException("negative retention");
        repository.lock(item);
        repository.prune(item, keep);
    }
}
