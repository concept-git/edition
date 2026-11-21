package io.edition.control.compositions.platform.tenant;

import static io.edition.control.compositions.platform.tenant.TenantTypes.*;

import io.edition.concepts.membership.api.MembershipApi.Group;
import io.edition.concepts.membership.api.MembershipApi.MemberId;
import io.edition.concepts.tenantregistry.api.TenantRegistryApi;

/** Invocation-bound completion bindings. Payloads are synchronous and never persisted. */
public final class TenantSignals {
    private TenantSignals() {}

    public record SeatOwner(
            Group group,
            MemberId owner,
            TenantRegistryApi.View tenant,
            io.edition.control.compositions.flow.RuleCompletion<Provisioned> completion) {
        @Override
        public String toString() {
            return "SeatOwner[flow=" + completion.flowId() + ", occurrence=" + completion.occurrenceId() + "]";
        }
    }

    public record InviteOwner(
            Group group,
            String ownerEmail,
            TenantRegistryApi.View tenant,
            io.edition.control.compositions.flow.RuleCompletion<Provisioned> completion) {
        @Override
        public String toString() {
            return "InviteOwner[flow=" + completion.flowId() + ", occurrence=" + completion.occurrenceId() + "]";
        }
    }
}
