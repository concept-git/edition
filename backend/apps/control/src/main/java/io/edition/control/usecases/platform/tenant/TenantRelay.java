package io.edition.control.usecases.platform.tenant;

import static io.edition.control.usecases.platform.tenant.TenantTypes.*;

import io.edition.control.modules.membership.api.MembershipApi.Group;
import io.edition.control.modules.membership.api.MembershipApi.MemberId;
import io.edition.control.modules.tenantregistry.api.TenantRegistryApi;

/** Technical completion publication; synchronization is implemented by the receiving named rules. */
@org.springframework.stereotype.Component
final class TenantRelay {
    private final org.springframework.context.ApplicationEventPublisher events;

    TenantRelay(org.springframework.context.ApplicationEventPublisher events) {
        this.events = events;
    }

    public Provisioned seatOwner(Group group, MemberId owner, TenantRegistryApi.View tenant) {
        var completion = io.edition.control.usecases.flow.RuleCompletion.<Provisioned>create();
        return completion.dispatch(events, new TenantSignals.SeatOwner(group, owner, tenant, completion));
    }

    public Provisioned inviteOwner(Group group, String ownerEmail, TenantRegistryApi.View tenant) {
        var completion = io.edition.control.usecases.flow.RuleCompletion.<Provisioned>create();
        return completion.dispatch(events, new TenantSignals.InviteOwner(group, ownerEmail, tenant, completion));
    }
}
