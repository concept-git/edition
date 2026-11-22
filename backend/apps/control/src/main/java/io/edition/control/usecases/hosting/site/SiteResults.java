package io.edition.control.usecases.hosting.site;

import io.edition.control.modules.site.api.SiteApi;
import io.edition.control.usecases.resource.SiteNotFoundException;
import java.util.UUID;

/** 概念有限输出 → flow 异常。 */
final class SiteResults {
    private SiteResults() {}

    static SiteApi.View changed(SiteApi.MutationResult result) {
        return switch (result) {
            case SiteApi.MutationResult.Changed ok -> ok.site();
            case SiteApi.MutationResult.NotFound ignored -> throw new SiteNotFoundException();
            case SiteApi.MutationResult.HomeNotMounted ignored -> throw new HomeNotMountedException();
            case SiteApi.MutationResult.OrderInvalid ignored -> throw new OrderInvalidException();
            case SiteApi.MutationResult.InvalidRule ignored ->
                throw new SitePatchInvalidException("rule", "unsupported");
            case SiteApi.MutationResult.InvalidTitleTemplate ignored ->
                throw new SitePatchInvalidException("titleTemplate", "invalid_format");
        };
    }

    static SiteApi.View mounted(SiteApi.MountResult result, UUID space, SiteApi.View current) {
        return switch (result) {
            case SiteApi.MountResult.Mounted ok -> ok.site();
            case SiteApi.MountResult.NotFound ignored -> throw new SiteNotFoundException();
            case SiteApi.MountResult.SlugTaken taken -> {
                if (taken.occupant().equals(space)) yield current;
                throw new SiteSlugTakenException();
            }
            case SiteApi.MountResult.SlugInvalid ignored -> throw new SlugInvalidException();
            case SiteApi.MountResult.TargetAlreadyMounted ignored -> throw new SpaceAlreadyMountedException();
            case SiteApi.MountResult.MountMissing ignored -> throw new SiteNotFoundException();
        };
    }

    static void deleted(SiteApi.DeleteResult result) {
        switch (result) {
            case SiteApi.DeleteResult.Deleted ignored -> {}
            case SiteApi.DeleteResult.NotFound ignored -> throw new SiteNotFoundException();
            case SiteApi.DeleteResult.NotEmpty ignored -> throw new SiteNotEmptyException();
        }
    }
}
