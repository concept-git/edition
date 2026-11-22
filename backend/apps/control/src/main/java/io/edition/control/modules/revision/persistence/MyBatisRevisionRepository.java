package io.edition.control.modules.revision.persistence;

import io.edition.control.modules.revision.api.*;
import io.edition.control.modules.revision.api.RevisionApi;
import io.edition.control.modules.revision.domain.RevisionRepository;
import java.util.List;
import java.util.Locale;
import java.util.Optional;
import java.util.UUID;
import org.springframework.stereotype.Repository;

@Repository
class MyBatisRevisionRepository implements RevisionRepository {
    private final RevisionMapper mapper;
    private final tools.jackson.databind.json.JsonMapper json;

    MyBatisRevisionRepository(RevisionMapper mapper, tools.jackson.databind.json.JsonMapper json) {
        this.json = json;
        this.mapper = mapper;
    }

    @Override
    public void lock(RevisionApi.ItemId item) {
        mapper.lock(item.value());
    }

    @Override
    public Optional<Stored> latest(RevisionApi.ItemId item) {
        return Optional.ofNullable(mapper.latest(item.value())).map(this::stored);
    }

    @Override
    public Stored insert(
            RevisionApi.ItemId item,
            int n,
            String content,
            String contentSha,
            RevisionApi.Actor actor,
            String note,
            io.edition.content.ContentProfile profile) {
        return stored(mapper.insert(
                item.value(),
                n,
                content,
                contentSha,
                stored(actor.type()),
                actor.id(),
                note,
                json.writeValueAsString(profile)));
    }

    @Override
    public Optional<Stored> find(RevisionApi.ItemId item, int n) {
        return Optional.ofNullable(mapper.find(item.value(), n)).map(this::stored);
    }

    @Override
    public List<RevisionApi.Entry> page(RevisionApi.ItemId item, Integer before, int limit) {
        return mapper.page(item.value(), before, limit).stream()
                .map(row -> new RevisionApi.Entry(
                        row.n(),
                        actor(row.actorType(), row.authorId()),
                        row.createdAt(),
                        row.note(),
                        row.sizeBytes(),
                        row.sizeDelta()))
                .toList();
    }

    @Override
    public long count(RevisionApi.ItemId item) {
        return mapper.count(item.value());
    }

    private Stored stored(RevisionMapper.RevisionRow row) {
        return new Stored(
                row.n(),
                row.content(),
                actor(row.actorType(), row.authorId()),
                row.createdAt(),
                row.note(),
                row.sizeBytes(),
                row.contentProfile() == null
                        ? null
                        : json.readValue(row.contentProfile(), io.edition.content.ContentProfile.class));
    }

    private static RevisionApi.Actor actor(String type, String id) {
        return new RevisionApi.Actor(
                RevisionApi.ActorType.valueOf(type.toUpperCase(Locale.ROOT)), id == null ? null : UUID.fromString(id));
    }

    private static String stored(Enum<?> value) {
        return value.name().toLowerCase(Locale.ROOT);
    }

    @Override
    public void prune(RevisionApi.ItemId item, int keep) {
        mapper.prune(item.value(), keep);
    }
}
