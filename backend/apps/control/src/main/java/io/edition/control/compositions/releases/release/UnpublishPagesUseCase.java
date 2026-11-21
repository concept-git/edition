package io.edition.control.compositions.releases.release;

import static io.edition.control.compositions.releases.release.ReleaseTypes.*;

import io.edition.control.compositions.flow.FlowResponse;
import java.util.List;
import java.util.UUID;
import org.springframework.transaction.annotation.Transactional;

@org.springframework.stereotype.Service
public class UnpublishPagesUseCase {
    private final ReleaseRelay relay;

    UnpublishPagesUseCase(ReleaseDependencies dependencies) {
        this.relay = dependencies.relay;
    }

    @Transactional
    public FlowResponse<BatchPublishResult> unpublishPages(
            String credential, UUID tenant, UUID space, List<UUID> ids, String key) {
        try (var requestScope = io.edition.control.compositions.RequestAuditContext.entry()) {
            return relay.selectPages(credential, tenant, space, ids, key, false);
        }
    }
}
