package io.space.control.compositions.authoring.pageediting;

import static io.space.control.compositions.authoring.pageediting.PageEditingTypes.*;

import io.space.concepts.page.api.PageApi;
import io.space.concepts.space.api.SpaceApi;
import java.util.UUID;

@org.springframework.stereotype.Service
public class HotfixAutoPromoteOnCompletion {

    private final HotfixSnapshots hotfixSnapshots;

    HotfixAutoPromoteOnCompletion(PageEditingDependencies dependencies) {
        this.hotfixSnapshots = dependencies.hotfixSnapshots;
    }

    void hotfixAutoPromote(UUID tenant, SpaceApi.View space, PageApi.View page, UUID actorId) {
        hotfixSnapshots.promote(space.id(), page, actorId);
    }

    @org.springframework.context.event.EventListener
    public void hotfixAutoPromote(PageEditingSignals.HotfixAutoPromote binding) {
        if (!binding.completion().claim("hotfixAutoPromote")) return;
        hotfixAutoPromote(binding.tenant(), binding.space(), binding.page(), binding.actorId());
        binding.completion().complete(null);
    }
}
