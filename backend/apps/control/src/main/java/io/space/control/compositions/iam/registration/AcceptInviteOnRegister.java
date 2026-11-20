package io.space.control.compositions.iam.registration;

import io.space.concepts.membership.api.MembershipApi;
import io.space.concepts.membership.api.MembershipApi.AcceptResult;
import io.space.concepts.membership.api.MembershipApi.InviteRef;
import io.space.concepts.membership.api.MembershipApi.MemberId;
import io.space.concepts.tenantregistry.api.TenantRegistryApi.TenantId;
import io.space.concepts.tenantregistry.api.TenantScopeApi;
import io.space.concepts.tenantregistry.api.TenantScopeApi.BootstrapReason;
import io.space.control.compositions.access.OwnerRootAccess;
import java.util.UUID;

@org.springframework.stereotype.Service
public class AcceptInviteOnRegister {

    private final MembershipApi memberships;
    private final TenantScopeApi tenantScope;
    private final OwnerRootAccess ownerRootAccess;

    AcceptInviteOnRegister(RegistrationDependencies dependencies) {
        this.memberships = dependencies.memberships;
        this.tenantScope = dependencies.tenantScope;
        this.ownerRootAccess = dependencies.ownerRootAccess;
    }

    private void acceptInviteOnRegister(UUID user, String email) {
        var member = new MemberId(user);
        var pending =
                tenantScope
                        .withoutTenant(BootstrapReason.INVITE_RESOLUTION, () -> memberships.pendingFor(email))
                        .stream()
                        // Team 邀请只发给已注册的现有 Tenant member，绝不通过注册暗中扩张租户边界。
                        .filter(invite -> invite.group().type() == MembershipApi.GroupType.TENANT)
                        .toList();
        for (var invite : pending) {
            // 落座与根授权同处一个租户作用域：grants.tenant_id 取自 app.tenant_id
            tenantScope.inTenant(new TenantId(invite.group().tenantId()), () -> {
                var accepted = memberships.accept(InviteRef.ofHandle(invite.handle()), member);
                if (accepted instanceof AcceptResult.Accepted seated) {
                    ownerRootAccess.grant(seated.group(), member, seated.role());
                }
            });
        }
    }

    @org.springframework.context.event.EventListener
    public void acceptInviteOnRegister(RegistrationSignals.AcceptInviteOnRegister binding) {
        if (!binding.completion().claim("acceptInviteOnRegister")) return;
        acceptInviteOnRegister(binding.user(), binding.email());
        binding.completion().complete(null);
    }
}
