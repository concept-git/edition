package io.edition.control.compositions.platform.tenant;

import static io.edition.control.compositions.platform.tenant.TenantTypes.*;

import io.edition.concepts.membership.api.MembershipApi;
import io.edition.concepts.membership.api.MembershipApi.Group;
import io.edition.concepts.membership.api.MembershipApi.MemberId;
import io.edition.concepts.membership.api.MembershipApi.Role;
import io.edition.concepts.tenantregistry.api.TenantRegistryApi;
import io.edition.control.compositions.access.OwnerRootAccess;

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
