package io.edition.control.usecases.authoring.tagging;

import static io.edition.control.usecases.authoring.tagging.TaggingTypes.*;

import io.edition.control.modules.tag.api.TagApi;
import io.edition.control.usecases.access.TenantAccess;
import io.edition.control.usecases.flow.FlowResponse;
import io.edition.control.usecases.flow.IdempotentFlowExecutor;
import io.edition.control.usecases.principal.PrincipalResolver.Resolution;
import java.util.UUID;
import org.springframework.transaction.annotation.Transactional;

@org.springframework.stereotype.Service
public class RenameTagUseCase {

    private final TagApi tags;

    private final TenantAccess tenants;

    private final TagAccess access;
    private final IdempotentFlowExecutor idempotency;

    RenameTagUseCase(TaggingDependencies dependencies) {
        this.tags = dependencies.tags;
        this.tenants = dependencies.tenants;
        this.access = dependencies.access;
        this.idempotency = dependencies.idempotency;
    }

    @Transactional
    public FlowResponse<RenameView> renameTag(String credential, UUID tenant, String from, String to, String key) {
        Resolution resolution = access.requireAdmin(credential, tenant);
        String source = TagLabels.require(from, "from");
        String target = TagLabels.require(to, "to");
        return idempotency.execute(
                resolution.principal(),
                key,
                "tag.rename",
                IdempotentFlowExecutor.canonical(tenant, source, target),
                200,
                RenameView.class,
                () -> tenants.inTenant(tenant, () -> {
                    switch (tags.rename(source, target)) {
                        case TagApi.RenameResult.Renamed ignored -> {}
                        case TagApi.RenameResult.NotFound ignored -> throw new TagNotFoundException();
                        case TagApi.RenameResult.Invalid ignored ->
                            throw new TagInvalidException("to", "invalid_format");
                    }
                    return new RenameView(source, target);
                }));
    }
}
