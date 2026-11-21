package io.edition.control.compositions.iam.membership;

import static io.edition.control.compositions.iam.membership.MembershipTypes.*;

import io.edition.concepts.membership.api.MembershipApi;
import io.edition.concepts.membership.api.MembershipApi.Group;
import io.edition.concepts.membership.api.MembershipApi.Role;
import io.edition.control.compositions.access.TenantAccess;
import io.edition.control.compositions.flow.FlowResponse;
import io.edition.control.compositions.flow.IdempotentFlowExecutor;
import io.edition.control.compositions.principal.PrincipalResolver.Resolution;
import java.util.List;
import java.util.Locale;
import java.util.UUID;
import org.springframework.transaction.annotation.Transactional;

@org.springframework.stereotype.Service
public class InviteUseCase {

    private final MembershipChecks membershipChecks;
    private static final String INVITE_OPERATION = MembershipDependencies.INVITE_OPERATION;
    private final TenantAccess access;
    private final IdempotentFlowExecutor idempotency;
    private final MembershipApi memberships;

    InviteUseCase(MembershipDependencies dependencies) {
        this.membershipChecks = dependencies.membershipChecks;
        this.access = dependencies.access;
        this.idempotency = dependencies.idempotency;
        this.memberships = dependencies.memberships;
    }

    @Transactional
    public FlowResponse<IssuedInvite> invite(
            String credential, UUID tenant, String email, String role, String idempotencyKey) {
        try (var requestScope = io.edition.control.compositions.RequestAuditContext.entry()) {
            Resolution admin =
                    access.requireUser(credential, tenant, List.of(TenantAccess.tenant(tenant)), TenantAccess.ADMIN);
            Group group = Group.tenant(tenant);
            String normalizedEmail = MemberRoles.normalizeEmail(email);
            Role parsedRole = MemberRoles.parse(role);
            return idempotency.execute(
                    admin.principal(),
                    idempotencyKey,
                    INVITE_OPERATION,
                    IdempotentFlowExecutor.canonical(
                            tenant, normalizedEmail, parsedRole.name().toLowerCase(Locale.ROOT)),
                    201,
                    IssuedInvite.class,
                    () -> access.inTenant(tenant, () -> {
                        membershipChecks.inviteAlreadyMember(group, normalizedEmail);
                        var invited = memberships.invite(group, normalizedEmail, parsedRole);
                        return new IssuedInvite(InviteSummary.of(invited.invite()), invited.token());
                    }));
        }
    }
}
