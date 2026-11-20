package io.space.control.compositions.platform.tenant;

import static io.space.control.compositions.platform.tenant.TenantTypes.*;

import io.space.concepts.membership.api.MembershipApi.Group;
import io.space.concepts.membership.api.MembershipApi.MemberId;
import io.space.concepts.tenantregistry.api.TenantRegistryApi;

/** Invocation-bound completion bindings. Payloads are synchronous and never persisted. */
public final class TenantSignals {
    private TenantSignals() {}

    public record SeatOwner(
            Group group,
            MemberId owner,
            TenantRegistryApi.View tenant,
            io.space.control.compositions.flow.RuleCompletion<Provisioned> completion) {
        @Override
        public String toString() {
            return "SeatOwner[flow=" + completion.flowId() + ", occurrence=" + completion.occurrenceId() + "]";
        }
    }

    public record InviteOwner(
            Group group,
            String ownerEmail,
            TenantRegistryApi.View tenant,
            io.space.control.compositions.flow.RuleCompletion<Provisioned> completion) {
        @Override
        public String toString() {
            return "InviteOwner[flow=" + completion.flowId() + ", occurrence=" + completion.occurrenceId() + "]";
        }
    }
}
