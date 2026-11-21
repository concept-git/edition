package io.edition.control.compositions.hosting.sitedelivery;

import static io.edition.control.compositions.hosting.sitedelivery.SiteDeliveryTypes.*;

import io.swagger.v3.oas.annotations.media.Schema;
import java.util.*;

/** Public composition inputs, results, and finite refusal types. */
public final class SiteDeliveryTypes {
    private SiteDeliveryTypes() {}

    public enum State {
        disabled,
        queued,
        running,
        retrying,
        failed,
        completed,
        access_pending
    }

    public record OnlineSpace(
            UUID spaceId,
            String slug,
            @Schema(nullable = true) UUID releaseId,
            @Schema(nullable = true) String readerHref) {}

    public record Desired(long epoch, List<OnlineSpace> spaces) {}

    public record Current(
            long epoch,
            @Schema(nullable = true) String primaryHost,
            @Schema(nullable = true) String readerHref,
            List<OnlineSpace> spaces,

            @Schema(
                    description =
                            "The actual snapshot is present and has no pending site fence. Each Reader request still enforces current reader policy; this does not prove anonymous access.")
            boolean readable,

            @Schema(nullable = true) String searchStatus) {}

    public record Status(
            @Schema(requiredMode = Schema.RequiredMode.REQUIRED)
            boolean enabled,

            @Schema(requiredMode = Schema.RequiredMode.REQUIRED)
            State status,

            @Schema(requiredMode = Schema.RequiredMode.REQUIRED)
            long targetEpoch,

            @Schema(nullable = true) Long onlineEpoch,
            @Schema(nullable = true) String primaryHost,
            List<OnlineSpace> spaces,
            @Schema(nullable = true) String error,
            boolean canRetry,
            @Schema(nullable = true) String searchStatus,
            @Schema(nullable = true) Desired desired,
            @Schema(nullable = true) Current current,

            @Schema(requiredMode = Schema.RequiredMode.REQUIRED)
            boolean terminal,

            @Schema(requiredMode = Schema.RequiredMode.REQUIRED)
            boolean successful,

            int nextPollAfterSeconds) {}
}
