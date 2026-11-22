package io.edition.control.usecases.authoring.tocediting;

import io.edition.control.modules.space.api.SpaceApi;
import io.edition.control.usecases.principal.PrincipalResolver.Resolution;
import io.edition.control.usecases.releases.release.AuthoredAutoRelease;
import java.util.UUID;
import org.springframework.stereotype.Component;

/** authored + autoRelease 时把目录 mutation 推进 live 快照；不是 sync。 */
@Component
class TocLivePromotion {
    private final AuthoredAutoRelease authoredAutoRelease;

    TocLivePromotion(AuthoredAutoRelease authoredAutoRelease) {
        this.authoredAutoRelease = authoredAutoRelease;
    }

    void afterMutation(UUID tenant, SpaceApi.View owner, Resolution resolution) {
        if (owner.mode() != SpaceApi.Mode.AUTHORED || !owner.autoRelease()) return;
        UUID actor = resolution.principal().id();
        if (actor == null) return;
        authoredAutoRelease.afterCompletion(tenant, owner, actor, "toc:" + owner.id());
    }
}
