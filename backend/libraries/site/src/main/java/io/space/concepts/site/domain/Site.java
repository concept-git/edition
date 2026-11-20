package io.space.concepts.site.domain;

import io.space.concepts.site.api.*;
import io.space.concepts.site.api.SiteApi;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.UUID;

/** Site aggregate：名称、挂载表、品牌与删除前置集中于此。 */
public final class Site {
    private final UUID id;
    private final UUID tenantId;
    private SiteName name;
    private String rule;
    private UUID home;
    private String titleTemplate;
    private SiteApi.Branding branding;
    private String locale;
    private String analyticsId;
    private SiteApi.RobotsPolicy robotsPolicy;
    private final List<SiteApi.Mount> mounts;
    private final Instant createdAt;
    private final UUID createdBy;
    private Instant updatedAt;
    private UUID updatedBy;

    public Site(
            UUID id,
            UUID tenantId,
            SiteName name,
            String rule,
            UUID home,
            String titleTemplate,
            SiteApi.Branding branding,
            String locale,
            String analyticsId,
            SiteApi.RobotsPolicy robotsPolicy,
            List<SiteApi.Mount> mounts,
            Instant createdAt,
            UUID createdBy,
            Instant updatedAt,
            UUID updatedBy) {
        this.id = Objects.requireNonNull(id, "site id");
        this.tenantId = Objects.requireNonNull(tenantId, "tenant id");
        this.name = Objects.requireNonNull(name, "site name");
        this.rule = rule == null || rule.isBlank() ? SiteApi.DEFAULT_RULE : rule;
        this.home = home;
        this.titleTemplate = titleTemplate;
        this.branding = branding == null ? new SiteApi.Branding(null, null, null) : branding;
        this.locale = locale;
        this.analyticsId = analyticsId;
        this.robotsPolicy = robotsPolicy == null ? SiteApi.RobotsPolicy.INDEX : robotsPolicy;
        this.mounts = new ArrayList<>(mounts == null ? List.of() : mounts);
        this.createdAt = Objects.requireNonNull(createdAt, "created at");
        this.createdBy = createdBy;
        this.updatedAt = Objects.requireNonNull(updatedAt, "updated at");
        this.updatedBy = updatedBy;
    }

    public boolean rename(SiteName next, SiteApi.ActorId actor) {
        Objects.requireNonNull(actor, "actor");
        if (name.equals(next)) return false;
        name = next;
        touch(actor);
        return true;
    }

    public boolean setRule(String next, SiteApi.ActorId actor) {
        Objects.requireNonNull(actor, "actor");
        String normalized = next == null ? SiteApi.DEFAULT_RULE : next.strip();
        if (!SiteApi.DEFAULT_RULE.equals(normalized)) throw new InvalidRule();
        if (rule.equals(normalized)) return false;
        rule = normalized;
        touch(actor);
        return true;
    }

    public boolean setHome(Optional<UUID> target, SiteApi.ActorId actor) {
        Objects.requireNonNull(actor, "actor");
        UUID next = target.orElse(null);
        if (next != null && mounts.stream().noneMatch(mount -> mount.target().equals(next))) {
            throw new HomeNotMounted();
        }
        if (Objects.equals(home, next)) return false;
        home = next;
        touch(actor);
        return true;
    }

    public boolean setBranding(SiteApi.Branding next, SiteApi.ActorId actor) {
        Objects.requireNonNull(actor, "actor");
        SiteApi.Branding value = next == null ? new SiteApi.Branding(null, null, null) : next;
        if (Objects.equals(branding, value)) return false;
        branding = value;
        touch(actor);
        return true;
    }

    public boolean setTitleTemplate(Optional<String> template, SiteApi.ActorId actor) {
        Objects.requireNonNull(actor, "actor");
        String next = template.orElse(null);
        if (next != null && (next.indexOf("%s") < 0 || next.indexOf("%s") != next.lastIndexOf("%s"))) {
            throw new InvalidTitleTemplate();
        }
        if (Objects.equals(titleTemplate, next)) return false;
        titleTemplate = next;
        touch(actor);
        return true;
    }

    public boolean setLocale(Optional<String> value, SiteApi.ActorId actor) {
        Objects.requireNonNull(actor, "actor");
        String next = value.orElse(null);
        if (Objects.equals(locale, next)) return false;
        locale = next;
        touch(actor);
        return true;
    }

    public boolean setAnalytics(Optional<String> value, SiteApi.ActorId actor) {
        Objects.requireNonNull(actor, "actor");
        String next = value.orElse(null);
        if (Objects.equals(analyticsId, next)) return false;
        analyticsId = next;
        touch(actor);
        return true;
    }

    public boolean setRobots(SiteApi.RobotsPolicy policy, SiteApi.ActorId actor) {
        Objects.requireNonNull(actor, "actor");
        Objects.requireNonNull(policy, "robots");
        if (robotsPolicy == policy) return false;
        robotsPolicy = policy;
        touch(actor);
        return true;
    }

    public MountOutcome mount(Slug slug, UUID target, SiteApi.ActorId actor) {
        Objects.requireNonNull(actor, "actor");
        Objects.requireNonNull(target, "target");
        if (mounts.stream().anyMatch(mount -> mount.slug().equals(slug.value()))) return MountOutcome.SLUG_TAKEN;
        if (mounts.stream().anyMatch(mount -> mount.target().equals(target))) return MountOutcome.TARGET_TAKEN;
        mounts.add(new SiteApi.Mount(slug.value(), target, mounts.size()));
        touch(actor);
        return MountOutcome.OK;
    }

    public MountOutcome remount(Slug from, Slug to, SiteApi.ActorId actor) {
        Objects.requireNonNull(actor, "actor");
        int index = indexOf(from.value());
        if (index < 0) return MountOutcome.MISSING;
        if (from.value().equals(to.value())) return MountOutcome.OK;
        if (mounts.stream().anyMatch(mount -> mount.slug().equals(to.value()))) return MountOutcome.SLUG_TAKEN;
        SiteApi.Mount current = mounts.get(index);
        mounts.set(index, new SiteApi.Mount(to.value(), current.target(), current.position()));
        touch(actor);
        return MountOutcome.OK;
    }

    public boolean unmount(String slug, SiteApi.ActorId actor) {
        Objects.requireNonNull(actor, "actor");
        int index = indexOf(slug);
        if (index < 0) return false;
        UUID target = mounts.remove(index).target();
        reindex();
        if (target.equals(home)) home = null;
        touch(actor);
        return true;
    }

    public boolean reorder(List<String> order, SiteApi.ActorId actor) {
        Objects.requireNonNull(actor, "actor");
        if (order.size() != mounts.size() || order.stream().distinct().count() != order.size()) {
            throw new OrderInvalid();
        }
        List<SiteApi.Mount> next = new ArrayList<>(order.size());
        for (String slug : order) {
            int index = indexOf(slug);
            if (index < 0) throw new OrderInvalid();
            SiteApi.Mount current = mounts.get(index);
            next.add(new SiteApi.Mount(current.slug(), current.target(), next.size()));
        }
        if (next.equals(mounts)) return false;
        mounts.clear();
        mounts.addAll(next);
        touch(actor);
        return true;
    }

    public void requireEmpty() {
        if (!mounts.isEmpty()) throw new NotEmpty();
    }

    public void persistedAt(Instant value) {
        updatedAt = Objects.requireNonNull(value, "updated at");
    }

    public SiteApi.View view() {
        return new SiteApi.View(
                id,
                tenantId,
                name.value(),
                rule,
                home,
                titleTemplate,
                branding,
                locale,
                analyticsId,
                robotsPolicy,
                List.copyOf(mounts),
                createdAt,
                createdBy,
                updatedAt,
                updatedBy);
    }

    public UUID id() {
        return id;
    }

    public UUID tenantId() {
        return tenantId;
    }

    public String name() {
        return name.value();
    }

    public String rule() {
        return rule;
    }

    public UUID home() {
        return home;
    }

    public String titleTemplate() {
        return titleTemplate;
    }

    public SiteApi.Branding branding() {
        return branding;
    }

    public String locale() {
        return locale;
    }

    public String analyticsId() {
        return analyticsId;
    }

    public String robots() {
        return robotsPolicy.value();
    }

    public List<SiteApi.Mount> mounts() {
        return List.copyOf(mounts);
    }

    public UUID updatedBy() {
        return updatedBy;
    }

    private int indexOf(String slug) {
        for (int i = 0; i < mounts.size(); i++) {
            if (mounts.get(i).slug().equals(slug)) return i;
        }
        return -1;
    }

    private void reindex() {
        for (int i = 0; i < mounts.size(); i++) {
            SiteApi.Mount current = mounts.get(i);
            mounts.set(i, new SiteApi.Mount(current.slug(), current.target(), i));
        }
    }

    private void touch(SiteApi.ActorId actor) {
        updatedBy = actor.value();
    }

    public enum MountOutcome {
        OK,
        SLUG_TAKEN,
        TARGET_TAKEN,
        MISSING
    }

    public static final class InvalidRule extends RuntimeException {}

    public static final class InvalidTitleTemplate extends RuntimeException {}

    public static final class HomeNotMounted extends RuntimeException {}

    public static final class OrderInvalid extends RuntimeException {}

    public static final class NotEmpty extends RuntimeException {}
}
