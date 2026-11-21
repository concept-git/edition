package io.edition.control.compositions.authoring.space;

import io.edition.concepts.collection.api.CollectionApi;
import io.edition.concepts.space.api.SpaceApi;
import io.edition.control.compositions.access.TenantAccess;
import io.edition.control.compositions.flow.FlowException;
import io.edition.control.compositions.flow.InvalidCursorException;
import io.edition.control.compositions.flow.ProblemCode;
import io.edition.control.compositions.principal.PrincipalResolver.Resolution;
import io.edition.control.compositions.resource.CollectionNotFoundException;
import io.edition.control.compositions.resource.ResourceChain;
import io.edition.shared.KeysetCursor;
import io.edition.shared.ValidationViolation;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;
import org.springframework.stereotype.Component;

/**
 * 空间列表的 collectionId 过滤：全量/未分组走 (updatedAt,id)；真实组走 membership 序 (position,id)。
 * 未知组 404；非法 collectionId 422。
 */
@Component
class SpaceCollectionListing {
    private final SpaceAccess access;
    private final TenantAccess tenants;
    private final SpaceApi spaces;
    private final CollectionApi collections;
    private final ResourceChain resources;
    private final SpaceProjection projection;

    SpaceCollectionListing(
            SpaceAccess access,
            TenantAccess tenants,
            SpaceApi spaces,
            CollectionApi collections,
            ResourceChain resources,
            SpaceProjection projection) {
        this.access = access;
        this.tenants = tenants;
        this.spaces = spaces;
        this.collections = collections;
        this.resources = resources;
        this.projection = projection;
    }

    SpaceTypes.SpacePage list(
            String credential, UUID tenant, String cursor, int limit, String status, String mode, String collectionId) {
        Resolution resolution = access.requireListAccess(credential, tenant);
        SpaceApi.Status parsedStatus = SpacePatch.optionalStatus(status);
        SpaceApi.Mode parsedMode = SpacePatch.optionalMode(mode);
        Filter filter = Filter.parse(collectionId);
        return switch (filter) {
            case Filter.All ignored ->
                scanUpdatedAt(resolution, tenant, cursor, limit, parsedStatus, parsedMode, Set.of());
            case Filter.Ungrouped ignored -> {
                Set<UUID> placed = tenants.inTenant(tenant, () -> collections.placed(tenant));
                yield scanUpdatedAt(resolution, tenant, cursor, limit, parsedStatus, parsedMode, placed);
            }
            case Filter.Grouped grouped ->
                listGrouped(resolution, tenant, grouped.id(), cursor, limit, parsedStatus, parsedMode);
        };
    }

    private SpaceTypes.SpacePage scanUpdatedAt(
            Resolution resolution,
            UUID tenant,
            String cursor,
            int limit,
            SpaceApi.Status status,
            SpaceApi.Mode mode,
            Set<UUID> exclude) {
        var visible = new ArrayList<SpaceTypes.SpaceSummary>(limit);
        String scanCursor = cursor;
        String nextCursor = null;
        while (visible.size() < limit) {
            int remaining = limit - visible.size();
            final String batchCursor = scanCursor;
            final SpaceApi.Page page;
            try {
                page = tenants.inTenant(
                        tenant,
                        () -> spaces.pageByTenant(
                                tenant,
                                batchCursor,
                                remaining,
                                Optional.ofNullable(status),
                                Optional.ofNullable(mode)));
            } catch (IllegalArgumentException invalid) {
                throw new InvalidCursorException();
            }
            Set<UUID> candidates = page.items().stream()
                    .map(SpaceApi.View::id)
                    .filter(id -> !exclude.contains(id))
                    .collect(Collectors.toUnmodifiableSet());
            Set<UUID> allowed = access.readable(resolution, tenant, candidates);
            tenants.inTenant(tenant, () -> {
                page.items().stream()
                        .filter(space -> !exclude.contains(space.id()) && allowed.contains(space.id()))
                        .map(space -> projection.summary(space, resolution, tenant))
                        .forEach(visible::add);
                return null;
            });
            nextCursor = page.nextCursor();
            if (nextCursor == null || visible.size() >= limit) break;
            scanCursor = nextCursor;
        }
        return new SpaceTypes.SpacePage(visible, nextCursor, null, projection.listActions(resolution, tenant));
    }

    private SpaceTypes.SpacePage listGrouped(
            Resolution resolution,
            UUID tenant,
            UUID collectionId,
            String cursor,
            int limit,
            SpaceApi.Status status,
            SpaceApi.Mode mode) {
        return tenants.inTenant(tenant, () -> {
            if (resources.collection(tenant, collectionId).isEmpty()) {
                throw new CollectionNotFoundException();
            }
            List<UUID> ordered = collections.itemsIn(new CollectionApi.CollectionId(collectionId));
            Optional<KeysetCursor> decoded;
            try {
                decoded = KeysetCursor.decode(cursor);
            } catch (IllegalArgumentException invalid) {
                throw new InvalidCursorException();
            }
            int cursorPos = 0;
            UUID cursorSpace = null;
            if (decoded.isPresent()) {
                try {
                    cursorPos = Math.toIntExact(decoded.orElseThrow().at().getEpochSecond());
                } catch (ArithmeticException invalid) {
                    throw new InvalidCursorException();
                }
                cursorSpace = decoded.orElseThrow().id();
            }
            var visible = new ArrayList<SpaceTypes.SpaceSummary>(limit);
            String nextCursor = null;
            boolean past = decoded.isEmpty();
            for (int position = 0; position < ordered.size(); position++) {
                UUID spaceId = ordered.get(position);
                if (!past) {
                    int compared = Integer.compare(position, cursorPos);
                    if (compared < 0 || (compared == 0 && spaceId.compareTo(cursorSpace) <= 0)) {
                        continue;
                    }
                    past = true;
                }
                Optional<SpaceApi.View> found = spaces.view(new SpaceApi.SpaceId(spaceId));
                if (found.isEmpty()) continue;
                SpaceApi.View view = found.orElseThrow();
                if (status != null && view.status() != status) continue;
                if (mode != null && view.mode() != mode) continue;
                if (!access.readable(resolution, tenant, Set.of(spaceId)).contains(spaceId)) continue;
                visible.add(projection.summary(view, resolution, tenant));
                if (visible.size() == limit) {
                    if (position < ordered.size() - 1) {
                        nextCursor = KeysetCursor.encode(Instant.ofEpochSecond(position), spaceId);
                    }
                    break;
                }
            }
            return new SpaceTypes.SpacePage(visible, nextCursor, null, projection.listActions(resolution, tenant));
        });
    }

    private sealed interface Filter {
        static Filter parse(String collectionId) {
            if (collectionId == null || collectionId.isBlank()) return new All();
            if ("ungrouped".equals(collectionId)) return new Ungrouped();
            try {
                return new Grouped(UUID.fromString(collectionId));
            } catch (IllegalArgumentException invalid) {
                throw new CollectionQueryInvalidException();
            }
        }

        record All() implements Filter {}

        record Ungrouped() implements Filter {}

        record Grouped(UUID id) implements Filter {}
    }

    static final class CollectionQueryInvalidException extends FlowException {
        CollectionQueryInvalidException() {
            super(ProblemCode.VALIDATION_FAILED, List.of(new ValidationViolation("collectionId", "invalid_format")));
        }
    }
}
