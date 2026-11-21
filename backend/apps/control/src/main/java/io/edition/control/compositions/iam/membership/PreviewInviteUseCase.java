package io.edition.control.compositions.iam.membership;

import static io.edition.control.compositions.iam.membership.MembershipTypes.*;

import io.edition.concepts.membership.api.MembershipApi;
import io.edition.concepts.membership.api.MembershipApi.InviteRef;
import io.edition.concepts.team.api.TeamApi;
import io.edition.concepts.tenantregistry.api.TenantRegistryApi;
import io.edition.concepts.tenantregistry.api.TenantScopeApi;
import io.edition.concepts.tenantregistry.api.TenantScopeApi.BootstrapReason;
import io.edition.control.compositions.access.TenantAccess;
import java.util.Locale;
import java.util.UUID;
import org.springframework.transaction.annotation.Transactional;

@org.springframework.stereotype.Service
public class PreviewInviteUseCase {

    private final TenantAccess access;

    private final MembershipApi memberships;

    private final TeamApi teams;
    private final TenantRegistryApi tenants;
    private final TenantScopeApi tenantScope;

    PreviewInviteUseCase(MembershipDependencies dependencies) {
        this.access = dependencies.access;
        this.memberships = dependencies.memberships;
        this.teams = dependencies.teams;
        this.tenants = dependencies.tenants;
        this.tenantScope = dependencies.tenantScope;
    }

    @Transactional(readOnly = true)
    public InvitePreview previewInvite(String token) {
        try (var requestScope = io.edition.control.compositions.RequestAuditContext.entry()) {
            // 解 token 之前不知道属于哪个租户：DDL 注释预警的窄解析入口。
            var invite = tenantScope
                    .withoutTenant(
                            BootstrapReason.INVITE_RESOLUTION, () -> memberships.inviteOf(InviteRef.ofToken(token)))
                    .orElseThrow(InviteInvalidException::new);
            UUID tenant = invite.group().tenantId();
            String tenantName = tenants.view(new TenantRegistryApi.TenantId(tenant))
                    .map(TenantRegistryApi.View::name)
                    .orElseThrow(InviteInvalidException::new);
            return new InvitePreview(
                    invite.group().type().name().toLowerCase(Locale.ROOT),
                    new InviteGroup(tenant, tenantName),
                    InviteGroup.teamOf(invite.group(), teams, access),
                    invite.email(),
                    invite.role().name().toLowerCase(Locale.ROOT),
                    invite.expiresAt());
        }
    }
}
