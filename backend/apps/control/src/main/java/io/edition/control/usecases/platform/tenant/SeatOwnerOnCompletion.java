package io.edition.control.usecases.platform.tenant;

import static io.edition.control.usecases.platform.tenant.TenantTypes.*;

import io.edition.control.modules.membership.api.MembershipApi;
import io.edition.control.modules.membership.api.MembershipApi.Group;
import io.edition.control.modules.membership.api.MembershipApi.MemberId;
import io.edition.control.modules.membership.api.MembershipApi.Role;
import io.edition.control.modules.tenantregistry.api.TenantRegistryApi;
import io.edition.control.usecases.access.OwnerRootAccess;

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
