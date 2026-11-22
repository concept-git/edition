package io.edition.control.modules.release.domain;

import io.edition.control.modules.release.api.*;
import io.edition.control.modules.release.api.ReleaseApi;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

public interface ReleaseRepository {
    Release insert(UUID scopeId, ReleaseApi.Source source, String label);

    Optional<Release> find(ReleaseApi.ReleaseId id);

    Optional<Release> lock(ReleaseApi.ReleaseId id);

    Optional<Release> lockLive(ReleaseApi.ScopeId scope);

    Release save(Release release);

    void insertSnapshot(ReleaseApi.ReleaseId id, ReleaseApi.Bundle bundle);

    boolean hasSnapshot(ReleaseApi.ReleaseId id);

    Optional<ReleaseApi.Bundle> snapshot(ReleaseApi.ReleaseId id);

    void pin(ReleaseApi.ReleaseId id, UUID reservation, java.time.Instant until);

    Optional<ReleaseApi.PageSnapshot> page(ReleaseApi.ReleaseId id, UUID pageId);

    List<ReleaseApi.PageHeader> pageHeaders(ReleaseApi.ReleaseId id);

    List<ReleaseApi.TocNode> toc(ReleaseApi.ReleaseId id);

    void delete(ReleaseApi.ReleaseId id);

    Optional<Release> live(ReleaseApi.ScopeId scope);

    List<Release> list(ReleaseApi.ScopeId scope);
    /** 多范围键集分页；before 为空从头开始，返回最多 limit 行（调用方多取一行判定 nextCursor）。 */
    List<Release> page(
            Set<ReleaseApi.ScopeId> scopes,
            ReleaseApi.Status status,
            java.time.Instant beforeCreatedAt,
            UUID beforeId,
            int limit);

    Optional<Release> lastOf(ReleaseApi.ScopeId scope, ReleaseApi.SourceKind kind);

    int count(ReleaseApi.ScopeId scope);

    int keep(ReleaseApi.ScopeId scope);

    void setKeep(ReleaseApi.ScopeId scope, int keep);

    void lockRetention(ReleaseApi.ScopeId scope);

    List<ReleaseApi.ReleaseId> archivedBeyondKeep(ReleaseApi.ScopeId scope, int keep);

    int recycleOrphanContents();

    record PageFingerprint(UUID pageId, String contentHash) {}

    List<PageFingerprint> fingerprints(ReleaseApi.ReleaseId id);

    void terminateScope(ReleaseApi.ScopeId scope);

    boolean referencesPage(UUID pageId);

    boolean referencesObject(String key);

    Set<String> objectKeys(ReleaseApi.ScopeId scope);

    ReleaseApi.Usage usage(ReleaseApi.ScopeId scope);
}
