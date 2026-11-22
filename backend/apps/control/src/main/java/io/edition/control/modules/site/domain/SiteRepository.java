package io.edition.control.modules.site.domain;

import io.edition.control.modules.site.api.*;
import io.edition.control.modules.site.api.SiteApi;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface SiteRepository {
    Site insert(UUID tenantId, SiteName name, SiteApi.ActorId actor);

    Optional<Site> find(SiteApi.SiteId id);

    Optional<Site> lock(SiteApi.SiteId id);

    Site save(Site site);

    void delete(SiteApi.SiteId id);

    List<Site> findByTenant(UUID tenantId);

    List<Site> pageByTenant(UUID tenantId, java.time.Instant beforeUpdatedAt, UUID beforeId, int limit);

    List<SiteApi.Occurrence> mountsOf(UUID target);
}
