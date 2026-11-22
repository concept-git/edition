package io.edition.control.usecases.platform.statistics;

import io.edition.control.modules.analytics.api.AnalyticsApi;
import io.edition.control.modules.page.api.*;
import io.edition.control.modules.release.api.*;
import io.edition.control.modules.space.api.*;
import io.edition.control.usecases.RequestAuditContext;
import java.time.Clock;
import java.util.UUID;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

/** 在概念动作的同一事务内记录创作/发版活动，业务回滚时活动一并回滚。 */
@Component
public class ActivityProjection {
    private final AnalyticsApi analytics;
    private final SpaceApi spaces;
    private final PageApi pages;
    private final Clock clock;

    public ActivityProjection(AnalyticsApi analytics, SpaceApi spaces, PageApi pages, Clock clock) {
        this.analytics = analytics;
        this.spaces = spaces;
        this.pages = pages;
        this.clock = clock;
    }

    @EventListener
    public void promoted(ReleaseEvents.Promoted e) {
        spaces.tenantOf(new SpaceApi.SpaceId(e.release().scopeId()))
                .ifPresent(t -> analytics.activity(
                        t,
                        e.release().scopeId(),
                        null,
                        RequestAuditContext.current().actorId(),
                        "promote",
                        clock.instant()));
    }

    @EventListener
    public void placed(SpaceEvents.Placed e) {
        pages.view(new PageApi.PageId(e.placement().item())).ifPresent(p -> changed(p.id(), p.createdBy()));
    }

    @EventListener
    public void edited(PageEvents.Edited e) {
        changed(e.page().id(), e.actor());
    }

    @EventListener
    public void renamed(PageEvents.Renamed e) {
        changed(e.page().id(), e.actor());
    }

    @EventListener
    public void metadata(PageEvents.MetadataChanged e) {
        changed(e.page().id(), e.actor());
    }

    @EventListener
    public void attached(PageEvents.Attached e) {
        changed(e.page().id(), e.actor());
    }

    @EventListener
    public void detached(PageEvents.Detached e) {
        changed(e.page().id(), e.actor());
    }

    private void changed(UUID page, PageApi.Actor actor) {
        if (actor.type() != PageApi.ActorType.USER) return;
        spaces.spaceOf(page)
                .ifPresent(s -> spaces.tenantOf(s)
                        .ifPresent(t -> analytics.activity(t, s.value(), page, actor.id(), "edit", clock.instant())));
    }
}
