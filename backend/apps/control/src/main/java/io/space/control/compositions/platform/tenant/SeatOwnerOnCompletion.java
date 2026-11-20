package io.space.control.compositions.platform.tenant;

import static io.space.control.compositions.platform.tenant.TenantTypes.*;

import io.space.concepts.membership.api.MembershipApi;
import io.space.concepts.membership.api.MembershipApi.Group;
import io.space.concepts.membership.api.MembershipApi.MemberId;
import io.space.concepts.membership.api.MembershipApi.Role;
import io.space.concepts.tenantregistry.api.TenantRegistryApi;
import io.space.control.compositions.access.OwnerRootAccess;

@org.springframework.stereotype.Service
public class SeatOwnerOnCompletion {

    private final MembershipApi memberships;

    private final OwnerRootAccess ownerRootAccess;

    SeatOwnerOnCompletion(TenantDependencies dependencies) {
        this.memberships = dependencies.memberships;
        this.ownerRootAccess = dependencies.ownerRootAccess;
    }

    private Provisioned seatOwner(Group group, MemberId owner, TenantRegistryApi.View tenant) {
        memberships.add(group, owner, Role.OWNER);
        ownerRootAccess.grant(group, owner, Role.OWNER);
        return new Provisioned(TenantView.of(tenant, 1), null);
    }

    @org.springframework.context.event.EventListener
    public void seatOwner(TenantSignals.SeatOwner binding) {
        if (!binding.completion().claim("seatOwner")) return;
        binding.completion().complete(seatOwner(binding.group(), binding.owner(), binding.tenant()));
    }
}
