package io.space.concepts.site.domain;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import io.space.concepts.site.api.*;
import io.space.concepts.site.api.SiteApi;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.Test;

class SiteTest {
    @Test
    void mountGivesTheTargetASiteAddressAndRejectsDuplicates() {
        Site site = site();
        UUID target = UUID.randomUUID();
        assertThat(site.mount(new Slug("API"), target, actor())).isEqualTo(Site.MountOutcome.OK);
        assertThat(site.mounts()).extracting(SiteApi.Mount::slug).containsExactly("api");
        assertThat(site.mount(new Slug("docs"), target, actor())).isEqualTo(Site.MountOutcome.TARGET_TAKEN);
        assertThat(site.mount(new Slug("api"), UUID.randomUUID(), actor())).isEqualTo(Site.MountOutcome.SLUG_TAKEN);
    }

    @Test
    void remountMovesTheSlugAndUnmountClearsHome() {
        Site site = site();
        UUID target = UUID.randomUUID();
        site.mount(new Slug("api"), target, actor());
        site.setHome(Optional.of(target), actor());
        assertThat(site.remount(new Slug("api"), new Slug("developers"), actor()))
                .isEqualTo(Site.MountOutcome.OK);
        assertThat(site.unmount("developers", actor())).isTrue();
        assertThat(site.home()).isNull();
        assertThat(site.mounts()).isEmpty();
        site.requireEmpty();
    }

    @Test
    void reorderRequiresAPermutationAndDeleteRejectsOccupiedSites() {
        Site site = site();
        UUID first = UUID.randomUUID();
        UUID second = UUID.randomUUID();
        site.mount(new Slug("a"), first, actor());
        site.mount(new Slug("b"), second, actor());
        assertThat(site.reorder(List.of("b", "a"), actor())).isTrue();
        assertThat(site.mounts()).extracting(SiteApi.Mount::slug).containsExactly("b", "a");
        assertThatThrownBy(() -> site.reorder(List.of("b"), actor())).isInstanceOf(Site.OrderInvalid.class);
        assertThatThrownBy(site::requireEmpty).isInstanceOf(Site.NotEmpty.class);
        assertThatThrownBy(() -> site.setHome(Optional.of(UUID.randomUUID()), actor()))
                .isInstanceOf(Site.HomeNotMounted.class);
        assertThatThrownBy(() -> site.setRule("/{other}/{itemPath}", actor())).isInstanceOf(Site.InvalidRule.class);
    }

    @Test
    void slugNormalizesAndRejectsIllegalShape() {
        assertThat(new Slug("  Ｇuide-中文 ").value()).isEqualTo("guide-中文");
        assertThatThrownBy(() -> new Slug("??")).isInstanceOf(Slug.Invalid.class);
        assertThatThrownBy(() -> new SiteName("  ")).isInstanceOf(SiteName.Invalid.class);
        assertThatThrownBy(() -> new SiteName("x".repeat(121))).isInstanceOf(SiteName.Invalid.class);
    }

    @Test
    void titleTemplateInvariantIsEnforcedByTheConcept() {
        var site = site();
        site.setTitleTemplate(Optional.of("%s | Docs"), actor());
        assertThatThrownBy(() -> site.setTitleTemplate(Optional.of("No placeholder"), actor()));
        assertThatThrownBy(() -> site.setTitleTemplate(Optional.of("%s %s"), actor()));
        assertThat(site.titleTemplate()).isEqualTo("%s | Docs");
        site.setTitleTemplate(Optional.empty(), actor());
        assertThat(site.titleTemplate()).isNull();
    }

    private static Site site() {
        Instant now = Instant.parse("2026-09-01T00:00:00Z");
        return new Site(
                UUID.randomUUID(),
                UUID.randomUUID(),
                new SiteName("Acme Docs"),
                SiteApi.DEFAULT_RULE,
                null,
                null,
                new SiteApi.Branding(null, null, null),
                null,
                null,
                SiteApi.RobotsPolicy.INDEX,
                List.of(),
                now,
                UUID.randomUUID(),
                now,
                UUID.randomUUID());
    }

    private static SiteApi.ActorId actor() {
        return new SiteApi.ActorId(UUID.randomUUID());
    }
}
