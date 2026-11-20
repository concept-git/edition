package io.space.control.compositions.hosting.reorganization;

import static io.space.control.compositions.hosting.reorganization.ReorganizationTypes.*;

import io.space.concepts.redirect.api.RedirectApi;
import java.util.UUID;

@org.springframework.stereotype.Service
public class RedirectOnRemount {

    private final RedirectApi redirects;

    RedirectOnRemount(ReorganizationDependencies dependencies) {
        this.redirects = dependencies.redirects;
    }

    public RedirectApi.Rule redirectOnRemount(UUID site, String oldSlug, UUID space) {
        try (var requestScope = io.space.control.compositions.RequestAuditContext.entry()) {
            return RedirectResults.registered(redirects.register(
                    new RedirectApi.ScopeId(site),
                    "/" + oldSlug + "/*",
                    RedirectApi.TargetType.SPACE,
                    space,
                    RedirectApi.Origin.AUTO));
        }
    }

    @org.springframework.context.event.EventListener
    public void redirectOnRemount(ReorganizationSignals.RedirectOnRemount binding) {
        if (!binding.completion().claim("redirectOnRemount")) return;
        binding.completion().complete(redirectOnRemount(binding.site(), binding.oldSlug(), binding.space()));
    }
}
