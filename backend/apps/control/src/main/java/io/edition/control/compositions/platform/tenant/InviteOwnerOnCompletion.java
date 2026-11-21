package io.edition.control.compositions.platform.tenant;

import static io.edition.control.compositions.platform.tenant.TenantTypes.*;

import io.edition.concepts.membership.api.MembershipApi;
import io.edition.concepts.membership.api.MembershipApi.Group;
import io.edition.concepts.membership.api.MembershipApi.Role;
import io.edition.concepts.tenantregistry.api.TenantRegistryApi;

@org.springframework.stereotype.Service
public class InviteOwnerOnCompletion {

    private final MembershipApi memberships;

    InviteOwnerOnCompletion(TenantDependencies dependencies) {
        this.memberships = dependencies.memberships;
    }

    private Provisioned inviteOwner(Group group, String ownerEmail, TenantRegistryApi.View tenant) {
        var invited = memberships.invite(group, ownerEmail, Role.OWNER);
        return new Provisioned(TenantView.of(tenant, 0), invited.token());
    }

    @org.springframework.context.event.EventListener
    public void inviteOwner(TenantSignals.InviteOwner binding) {
        if (!binding.completion().claim("inviteOwner")) return;
        binding.completion().complete(inviteOwner(binding.group(), binding.ownerEmail(), binding.tenant()));
    }
}
