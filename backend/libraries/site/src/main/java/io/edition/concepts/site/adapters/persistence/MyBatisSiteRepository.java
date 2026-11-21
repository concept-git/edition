package io.edition.concepts.site.adapters.persistence;

import io.edition.concepts.site.api.*;
import io.edition.concepts.site.api.SiteApi;
import io.edition.concepts.site.domain.Site;
import io.edition.concepts.site.domain.SiteName;
import io.edition.concepts.site.domain.SiteRepository;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;
import org.springframework.stereotype.Repository;
import tools.jackson.core.JacksonException;
import tools.jackson.databind.json.JsonMapper;

@Repository
class MyBatisSiteRepository implements SiteRepository {
    private final SiteMapper mapper;
    private final JsonMapper json;

    MyBatisSiteRepository(SiteMapper mapper, JsonMapper json) {
        this.mapper = mapper;
        this.json = json;
    }

    @Override
    public Site insert(UUID tenantId, SiteName name, SiteApi.ActorId actor) {
        return site(mapper.insert(tenantId, name.value(), actor.value()), List.of());
    }

    @Override
    public Optional<Site> find(SiteApi.SiteId id) {
        SiteMapper.SiteRow row = mapper.find(id.value());
        if (row == null) return Optional.empty();
        return Optional.of(site(row, mapper.mounts(id.value())));
    }

    @Override
    public Optional<Site> lock(SiteApi.SiteId id) {
        SiteMapper.SiteRow row = mapper.lock(id.value());
        if (row == null) return Optional.empty();
        return Optional.of(site(row, mapper.mounts(id.value())));
    }

    @Override
    public Site save(Site value) {
        SiteMapper.SiteRow row = mapper.save(
                value.id(),
                value.name(),
                value.rule(),
                value.titleTemplate(),
                brandingJson(value.branding()),
                value.locale(),
                value.analyticsId(),
                value.robots(),
                value.home() == null ? null : value.home().toString(),
                value.updatedBy());
        mapper.clearMounts(value.id());
        for (SiteApi.Mount mount : value.mounts()) {
            mapper.insertMount(value.id(), mount.slug(), mount.target(), mount.position());
        }
        return site(row, mapper.mounts(value.id()));
    }

    @Override
    public void delete(SiteApi.SiteId id) {
        mapper.delete(id.value());
    }

    @Override
    public List<Site> findByTenant(UUID tenantId) {
        return withMounts(mapper.findByTenant(tenantId));
    }

    @Override
    public List<Site> pageByTenant(UUID tenantId, java.time.Instant beforeUpdatedAt, UUID beforeId, int limit) {
        return withMounts(mapper.pageByTenant(tenantId, beforeUpdatedAt, beforeId, limit));
    }

    @Override
    public List<SiteApi.Occurrence> mountsOf(UUID target) {
        return mapper.mountsOf(target).stream()
                .map(row -> new SiteApi.Occurrence(new SiteApi.SiteId(UUID.fromString(row.siteId())), row.slug()))
                .toList();
    }

    /** 列表与分页共用批量装配；站点顺序及各自挂载序保持查询结果的顺序。 */
    private List<Site> withMounts(List<SiteMapper.SiteRow> rows) {
        if (rows.isEmpty()) return List.of();
        var ids = rows.stream().map(SiteMapper.SiteRow::id).toList();
        Map<String, List<SiteMapper.MountRow>> bySite =
                mapper.mountsOfSites(ids).stream().collect(Collectors.groupingBy(SiteMapper.MountRow::siteId));
        return rows.stream()
                .map(row -> site(row, bySite.getOrDefault(row.id(), List.of())))
                .toList();
    }

    private Site site(SiteMapper.SiteRow row, List<SiteMapper.MountRow> mounts) {
        return new Site(
                UUID.fromString(row.id()),
                UUID.fromString(row.tenantId()),
                new SiteName(row.name()),
                row.pathRule(),
                uuid(row.homeSpaceId()),
                row.titleTemplate(),
                branding(row.branding()),
                row.locale(),
                row.analyticsId(),
                row.robotsPolicy() == null
                        ? SiteApi.RobotsPolicy.INDEX
                        : SiteApi.RobotsPolicy.parse(row.robotsPolicy()),
                mounts.stream()
                        .map(item -> new SiteApi.Mount(item.slug(), UUID.fromString(item.spaceId()), item.position()))
                        .toList(),
                row.createdAt(),
                uuid(row.createdBy()),
                row.updatedAt(),
                uuid(row.updatedBy()));
    }

    private static UUID uuid(String value) {
        return value == null ? null : UUID.fromString(value);
    }

    private SiteApi.Branding branding(String value) {
        if (value == null || value.isBlank() || value.equals("null")) {
            return new SiteApi.Branding(null, null, null);
        }
        try {
            return json.readValue(value, SiteApi.Branding.class);
        } catch (JacksonException corrupt) {
            throw new IllegalStateException("hosting.sites.branding is not a branding object", corrupt);
        }
    }

    private String brandingJson(SiteApi.Branding branding) {
        if (branding == null) return "{}";
        try {
            return json.writeValueAsString(branding);
        } catch (JacksonException impossible) {
            throw new IllegalStateException("site branding is not serializable", impossible);
        }
    }
}
