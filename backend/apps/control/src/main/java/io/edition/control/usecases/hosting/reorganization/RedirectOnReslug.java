package io.edition.control.usecases.hosting.reorganization;

import static io.edition.control.usecases.hosting.reorganization.ReorganizationTypes.*;

import io.edition.control.modules.redirect.api.RedirectApi;
import io.edition.control.modules.site.api.SiteApi;
import java.util.List;
import java.util.UUID;

@org.springframework.stereotype.Service
public class RedirectOnReslug {

    private final SiteApi sites;

    private final RedirectApi redirects;

    RedirectOnReslug(ReorganizationDependencies dependencies) {
        this.sites = dependencies.sites;
        this.redirects = dependencies.redirects;
    }

    public List<RedirectApi.Rule> redirectOnReslug(UUID oldSpace, String oldPageSlug, UUID page) {
        try (var requestScope = io.edition.control.usecases.RequestAuditContext.entry()) {
            return sites.mountsOf(oldSpace).stream()
                    .map(mount -> RedirectResults.registered(redirects.register(
                            new RedirectApi.ScopeId(mount.site().value()),
                            "/" + mount.slug() + "/" + oldPageSlug + "/*",
                            RedirectApi.TargetType.PAGE,
                            page,
                            RedirectApi.Origin.AUTO)))
                    .toList();
        }
    }

    @org.springframework.context.event.EventListener
    public void redirectOnReslug(ReorganizationSignals.RedirectOnReslug binding) {
        if (!binding.completion().claim("redirectOnReslug")) return;
        binding.completion().complete(redirectOnReslug(binding.oldSpace(), binding.oldPageSlug(), binding.page()));
    }
}
