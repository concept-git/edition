package io.edition.control.usecases.platform.webhook;

import io.edition.control.modules.customdomain.api.CustomDomainEvents;
import io.edition.control.modules.page.api.PageEvents;
import io.edition.control.modules.release.api.*;
import io.edition.control.modules.site.api.SiteApi;
import io.edition.control.modules.space.api.SpaceApi;
import io.edition.control.modules.webhook.api.WebhookApi;
import io.edition.control.usecases.RequestAuditContext;
import java.time.Clock;
import java.util.UUID;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

@Component
public class WebhookEvents {
    private final WebhookApi hooks;
    private final SpaceApi spaces;
    private final SiteApi sites;
    private final Clock clock;

    public WebhookEvents(WebhookApi hooks, SpaceApi spaces, SiteApi sites, Clock clock) {
        this.hooks = hooks;
        this.spaces = spaces;
        this.sites = sites;
        this.clock = clock;
    }

    @EventListener
    public void promoted(ReleaseEvents.Promoted e) {
        release("release.promoted", e.release());
    }

    @EventListener
    public void flagged(ReleaseEvents.Flagged e) {
        release("release.flagged", e.release());
    }

    @EventListener
    public void held(ReleaseEvents.ValidationRejected e) {
        release("release.held", e.release());
    }

    @EventListener
    public void published(PageEvents.Published e) {
        spaces.spaceOf(e.page().id())
                .ifPresent(s -> spaces.tenantOf(s)
                        .ifPresent(t -> capture(t, "page.published", e.page().id(), s.value(), null)));
    }

    @EventListener
    public void verified(CustomDomainEvents.Verified e) {
        sites.tenantOf(new SiteApi.SiteId(e.domain().target()))
                .ifPresent(t -> capture(
                        t,
                        "domain.verified",
                        e.domain().target(),
                        null,
                        e.domain().target()));
    }

    private void release(String type, ReleaseApi.View view) {
        spaces.tenantOf(new SpaceApi.SpaceId(view.scopeId()))
                .ifPresent(t -> capture(t, type, view.id(), view.scopeId(), null));
    }

    private void capture(UUID tenant, String type, UUID resource, UUID space, UUID site) {
        hooks.capture(
                tenant,
                new WebhookApi.Event(
                        UUID.randomUUID(),
                        type,
                        clock.instant(),
                        resource,
                        space,
                        site,
                        "ok",
                        RequestAuditContext.current().requestId()));
    }
}
