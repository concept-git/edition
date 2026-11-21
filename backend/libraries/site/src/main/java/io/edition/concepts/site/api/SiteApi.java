package io.edition.concepts.site.api;

import java.time.Instant;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.UUID;

/** Site 概念唯一出口。调用方负责建立 tenant scope。 */
public interface SiteApi {
    String DEFAULT_RULE = "/{slug}/{itemPath}";

    View create(ActorId actor, UUID tenantId, String name);

    MutationResult rename(ActorId actor, SiteId site, String name);

    MutationResult setRule(ActorId actor, SiteId site, String rule);

    MutationResult setHome(ActorId actor, SiteId site, Optional<UUID> target);

    MutationResult setBranding(ActorId actor, SiteId site, Branding branding);

    MutationResult setTitleTemplate(ActorId actor, SiteId site, Optional<String> template);

    MutationResult setLocale(ActorId actor, SiteId site, Optional<String> locale);

    MutationResult setAnalytics(ActorId actor, SiteId site, Optional<String> analyticsId);

    MutationResult setRobots(ActorId actor, SiteId site, RobotsPolicy policy);

    MountResult mount(ActorId actor, SiteId site, UUID target, String slug);

    MountResult remount(ActorId actor, SiteId site, String slug, String newSlug);

    MutationResult unmount(ActorId actor, SiteId site, String slug);

    MutationResult reorder(ActorId actor, SiteId site, List<String> order);

    DeleteResult delete(ActorId actor, SiteId site);

    Optional<View> view(SiteId site);

    List<View> listByTenant(UUID tenantId);

    Page pageByTenant(UUID tenantId, String cursor, int limit);

    Optional<UUID> tenantOf(SiteId site);

    Optional<UUID> targetAt(SiteId site, String slug);

    List<Mount> mounts(SiteId site);

    List<Occurrence> mountsOf(UUID target);

    Optional<String> slugOf(SiteId site, UUID target);

    record SiteId(UUID value) {
        public SiteId {
            Objects.requireNonNull(value, "site id");
        }
    }

    record ActorId(UUID value) {
        public ActorId {
            Objects.requireNonNull(value, "actor id");
        }
    }

    enum RobotsPolicy {
        INDEX("index"),
        NOINDEX("noindex");
        private final String value;

        RobotsPolicy(String value) {
            this.value = value;
        }

        public String value() {
            return value;
        }

        public static RobotsPolicy parse(String value) {
            return java.util.Arrays.stream(values())
                    .filter(item -> item.value.equals(value))
                    .findFirst()
                    .orElseThrow(() -> new IllegalArgumentException("invalid robots policy"));
        }
    }

    record Branding(String logo, String favicon, String primaryColor) {}

    record Mount(String slug, UUID target, int position) {}

    record Occurrence(SiteId site, String slug) {}

    record View(
            UUID id,
            UUID tenantId,
            String name,
            String rule,
            UUID home,
            String titleTemplate,
            Branding branding,
            String locale,
            String analyticsId,
            RobotsPolicy robotsPolicy,
            List<Mount> mounts,
            Instant createdAt,
            UUID createdBy,
            Instant updatedAt,
            UUID updatedBy) {
        public View {
            mounts = List.copyOf(mounts);
            branding = branding == null ? new Branding(null, null, null) : branding;
        }
    }

    record Page(List<View> items, String nextCursor) {
        public Page {
            items = List.copyOf(items);
        }
    }

    sealed interface MutationResult {
        record Changed(View site) implements MutationResult {}

        record NotFound() implements MutationResult {}

        record HomeNotMounted() implements MutationResult {}

        record OrderInvalid() implements MutationResult {}

        record InvalidRule() implements MutationResult {}

        record InvalidTitleTemplate() implements MutationResult {}
    }

    sealed interface MountResult {
        record Mounted(View site) implements MountResult {}

        record NotFound() implements MountResult {}

        record SlugTaken(UUID occupant) implements MountResult {}

        record SlugInvalid() implements MountResult {}

        record TargetAlreadyMounted() implements MountResult {}

        record MountMissing() implements MountResult {}
    }

    sealed interface DeleteResult {
        record Deleted() implements DeleteResult {}

        record NotFound() implements DeleteResult {}

        record NotEmpty() implements DeleteResult {}
    }

    Optional<View> lock(SiteId site);
}
