package io.edition.control.usecases.releases.release;

import io.edition.control.modules.permission.api.PermissionApi.Operation;
import io.edition.control.modules.release.api.ReleaseApi;
import io.edition.control.modules.space.api.SpaceApi;
import io.edition.control.usecases.access.PermissionDeniedException;
import io.edition.control.usecases.access.TenantAccess;
import io.edition.control.usecases.principal.PrincipalResolver.Resolution;
import io.edition.control.usecases.resource.ResourceChain;
import io.edition.control.usecases.resource.SpaceNotFoundException;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import org.springframework.stereotype.Component;

/** 发版 flow 的访问投影：[tenant, space] 链，不含 Site。 */
@Component
public class ReleaseAccess {
    private final TenantAccess tenants;
    private final ResourceChain resources;
    private final ReleaseApi releases;
    private final SpaceApi spaces;

    ReleaseAccess(TenantAccess tenants, ResourceChain resources, ReleaseApi releases, SpaceApi spaces) {
        this.tenants = tenants;
        this.resources = resources;
        this.releases = releases;
        this.spaces = spaces;
    }

    public SpaceApi.View space(UUID tenant, UUID space) {
        return resources.space(tenant, space).orElseThrow(SpaceNotFoundException::new);
    }

    public SpaceApi.View lockSpace(UUID tenant, UUID space) {
        return tenants.inTenant(
                tenant,
                () -> spaces.lock(new SpaceApi.SpaceId(space))
                        .filter(value -> value.tenantId().equals(tenant))
                        .orElseThrow(SpaceNotFoundException::new));
    }

    public ReleaseApi.View requireRelease(UUID space, UUID releaseId) {
        return releases.list(new ReleaseApi.ScopeId(space)).stream()
                .filter(item -> item.id().equals(releaseId))
                .findFirst()
                .orElseThrow(ReleaseNotFoundException::new);
    }

    void requireDiscardable(ReleaseApi.View release) {
        if (!discardable(release.status())) throw new ReleaseNotDiscardableException();
    }

    void requirePromotable(ReleaseApi.View release) {
        if (!promotable(release.status())) throw new ReleaseNotPromotableException();
    }

    void requireArchived(ReleaseApi.View release) {
        if (release.status() != ReleaseApi.Status.ARCHIVED) throw new ReleaseNotArchivedException();
    }

    public Resolution require(String credential, UUID tenant, UUID space, Operation operation) {
        return tenants.require(credential, tenant, chain(tenant, space), operation);
    }

    /** 租户级聚合只用准入，不要求任何单一空间的 read；可读范围随后经 {@link #readable} 批量收窄。 */
    Resolution admit(String credential, UUID tenant) {
        return tenants.admit(credential, tenant);
    }

    /** 批量收窄为调用者 [tenant, space]/read 成立的空间，一次问 Permission.filter。 */
    Set<UUID> readable(Resolution resolution, UUID tenant, Set<UUID> spaces) {
        Set<List<io.edition.control.modules.permission.api.PermissionApi.Resource>> chains = spaces.stream()
                .map(space -> chain(tenant, space))
                .collect(java.util.stream.Collectors.toUnmodifiableSet());
        return tenants.filter(resolution, tenant, chains, TenantAccess.READ).stream()
                .map(List::getLast)
                .map(io.edition.control.modules.permission.api.PermissionApi.Resource::id)
                .collect(java.util.stream.Collectors.toUnmodifiableSet());
    }

    public UUID actorId(Resolution resolution) {
        if (resolution.principal().id() == null) throw new PermissionDeniedException();
        return resolution.principal().id();
    }

    Set<ReleaseTypes.Action> itemActions(
            Resolution resolution, UUID tenant, SpaceApi.View space, ReleaseApi.View release) {
        var chain = chain(tenant, space.id());
        if (!tenants.allows(resolution, tenant, chain, TenantAccess.READ)) return Set.of();
        var actions = new LinkedHashSet<ReleaseTypes.Action>();
        boolean active = space.status() == SpaceApi.Status.ACTIVE;
        boolean publish = active && tenants.allows(resolution, tenant, chain, TenantAccess.PUBLISH);
        boolean authored = space.mode() == SpaceApi.Mode.AUTHORED;
        boolean synced = space.mode() == SpaceApi.Mode.SYNCED;
        boolean admin = tenants.allows(resolution, tenant, chain, TenantAccess.ADMIN);
        if (publish && authored && discardable(release.status())) actions.add(ReleaseTypes.Action.DISCARD);
        if (publish && release.status() == ReleaseApi.Status.ARCHIVED) {
            actions.add(ReleaseTypes.Action.ROLLBACK);
        }
        if (publish && promotable(release.status())) actions.add(ReleaseTypes.Action.PROMOTE);
        if (publish && synced && discardable(release.status())) actions.add(ReleaseTypes.Action.DISCARD);
        if (publish
                && synced
                && release.status() == ReleaseApi.Status.FLAGGED
                && release.source().kind() == ReleaseApi.SourceKind.IMPORT) {
            actions.add(ReleaseTypes.Action.APPROVE);
        }
        if ((release.status() == ReleaseApi.Status.LIVE || release.status() == ReleaseApi.Status.ARCHIVED)
                && tenants.allows(resolution, tenant, chain, TenantAccess.PUBLISH))
            actions.add(ReleaseTypes.Action.EXPORT);
        if (admin) actions.add(ReleaseTypes.Action.ANNOTATE);
        return io.edition.control.usecases.access.ManagementCapabilities.effective(resolution, actions, "content");
    }

    Set<ReleaseTypes.Action> collectionActions(Resolution resolution, UUID tenant, SpaceApi.View space) {
        var chain = chain(tenant, space.id());
        if (!tenants.allows(resolution, tenant, chain, TenantAccess.READ)) return Set.of();
        var actions = new LinkedHashSet<ReleaseTypes.Action>();
        boolean active = space.status() == SpaceApi.Status.ACTIVE;
        boolean publish = active && tenants.allows(resolution, tenant, chain, TenantAccess.PUBLISH);
        if (publish && space.mode() == SpaceApi.Mode.AUTHORED) actions.add(ReleaseTypes.Action.BUILD);
        if (publish && space.mode() == SpaceApi.Mode.SYNCED) actions.add(ReleaseTypes.Action.IMPORT);
        if (tenants.allows(resolution, tenant, chain, TenantAccess.ADMIN)) {
            actions.add(ReleaseTypes.Action.SET_RETENTION);
        }
        return io.edition.control.usecases.access.ManagementCapabilities.effective(resolution, actions, "content");
    }

    private static boolean discardable(ReleaseApi.Status status) {
        return status == ReleaseApi.Status.DRAFT
                || status == ReleaseApi.Status.FLAGGED
                || status == ReleaseApi.Status.VALIDATED;
    }

    private static boolean promotable(ReleaseApi.Status status) {
        return status == ReleaseApi.Status.VALIDATED || status == ReleaseApi.Status.ARCHIVED;
    }

    static List<io.edition.control.modules.permission.api.PermissionApi.Resource> chain(UUID tenant, UUID space) {
        return List.of(TenantAccess.tenant(tenant), TenantAccess.space(space));
    }
}
