package io.edition.control.usecases.iam.membership;

import static io.edition.control.usecases.iam.membership.MembershipTypes.*;

import io.edition.control.modules.membership.api.MembershipApi;
import io.edition.control.modules.membership.api.MembershipApi.AcceptResult;
import io.edition.control.modules.membership.api.MembershipApi.Group;
import io.edition.control.modules.membership.api.MembershipApi.InviteRef;
import io.edition.control.modules.membership.api.MembershipApi.MemberId;
import io.edition.control.modules.team.api.TeamApi;
import io.edition.control.modules.tenantregistry.api.TenantRegistryApi;
import io.edition.control.modules.tenantregistry.api.TenantScopeApi;
import io.edition.control.modules.tenantregistry.api.TenantScopeApi.BootstrapReason;
import io.edition.control.usecases.access.TenantAccess;
import java.util.Locale;
import java.util.UUID;
import org.springframework.transaction.annotation.Transactional;

@org.springframework.stereotype.Service
public class AcceptInviteUseCase {
    private final MembershipRelay relay;
    private final MembershipChecks membershipChecks;

    private final TenantAccess access;

    private final MembershipApi memberships;

    private final TeamApi teams;
    private final TenantRegistryApi tenants;
    private final TenantScopeApi tenantScope;

    AcceptInviteUseCase(MembershipDependencies dependencies) {
        this.relay = dependencies.relay;
        this.membershipChecks = dependencies.membershipChecks;
        this.access = dependencies.access;
        this.memberships = dependencies.memberships;
        this.teams = dependencies.teams;
        this.tenants = dependencies.tenants;
        this.tenantScope = dependencies.tenantScope;
    }

    @Transactional(noRollbackFor = InviteAlreadyAcceptedException.class)
    public Accepted acceptInvite(UUID principal, String token) {
        try (var requestScope = io.edition.control.usecases.RequestAuditContext.entry()) {
            var member = new MemberId(principal);
            var invite = tenantScope
                    .withoutTenant(
                            BootstrapReason.INVITE_RESOLUTION, () -> memberships.inviteOf(InviteRef.ofToken(token)))
                    .orElseThrow(InviteInvalidException::new);
            membershipChecks.acceptInviteEmailMismatch(principal, invite.email());
            UUID tenant = invite.group().tenantId();
            boolean teamInvite = invite.group().type() == MembershipApi.GroupType.TEAM;

            // 授权必须与落座同处租户上下文：grants.tenant_id 取自 app.tenant_id，脱离作用域会写成 NULL
            var accepted = access.inTenant(tenant, () -> {
                if (teamInvite) {
                    if (memberships.lockMembership(Group.tenant(tenant), member).isEmpty()) {
                        throw new TenantMembershipRequiredException();
                    }
                    teams.lock(new TeamApi.TeamId(invite.group().id())).orElseThrow(InviteInvalidException::new);
                }
                var result = memberships.accept(InviteRef.ofToken(token), member);
                if (result instanceof AcceptResult.Accepted ok) {
                    relay.grantOwnerRootAccess(ok.group(), member, ok.role());
                }
                return result;
            });
            return switch (accepted) {
                case AcceptResult.Invalid ignored -> throw new InviteInvalidException();
                case AcceptResult.Expired ignored -> throw new InviteExpiredException();
                case AcceptResult.AlreadyMember ignored -> throw new InviteAlreadyAcceptedException();
                case AcceptResult.Accepted ok -> {
                    var tenantView = tenants.view(new TenantRegistryApi.TenantId(tenant))
                            .orElseThrow(InviteInvalidException::new);
                    yield new Accepted(
                            ok.group().type().name().toLowerCase(Locale.ROOT),
                            new InviteGroup(tenantView.id().value(), tenantView.name()),
                            InviteGroup.teamOf(ok.group(), teams, access),
                            ok.role().name().toLowerCase(Locale.ROOT));
                }
            };
        }
    }
}
