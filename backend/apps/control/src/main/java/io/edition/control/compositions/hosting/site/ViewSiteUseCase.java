package io.edition.control.compositions.hosting.site;

import static io.edition.control.compositions.hosting.site.SiteTypes.*;

import java.util.UUID;
import org.springframework.transaction.annotation.Transactional;

@org.springframework.stereotype.Service
public class ViewSiteUseCase {

    private final SiteProjection projection;

    ViewSiteUseCase(SiteDependencies dependencies) {
        this.projection = dependencies.projection;
    }

    @Transactional(readOnly = true)
    public SiteDetail viewSite(String credential, UUID tenant, UUID site) {
        return projection.view(credential, tenant, site);
    }
}
