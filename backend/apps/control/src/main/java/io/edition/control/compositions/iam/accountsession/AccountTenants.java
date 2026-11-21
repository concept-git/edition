package io.edition.control.compositions.iam.accountsession;

import static io.edition.control.compositions.iam.accountsession.AccountSessionTypes.*;

import io.edition.concepts.membership.api.MembershipApi;
import io.edition.concepts.tenantregistry.api.TenantRegistryApi;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.UUID;
import java.util.function.Function;

/** Shared entry policy or read projection; no independent causal invocation. */
@org.springframework.stereotype.Component
final class AccountTenants {
    private final MembershipApi memberships;
    private final TenantRegistryApi tenants;

    AccountTenants(MembershipApi memberships, TenantRegistryApi tenants) {
        this.memberships = memberships;
        this.tenants = tenants;
    }

    List<TenantMembership> tenantsOf(UUID principal) {
        var groups = memberships.groupsOf(new MembershipApi.MemberId(principal)).stream()
                .filter(membership -> membership.group().type() == MembershipApi.GroupType.TENANT)
                .toList();
        Map<UUID, TenantRegistryApi.View> views = tenants
                .viewsOf(groups.stream()
                        .map(membership -> new TenantRegistryApi.TenantId(
                                membership.group().tenantId()))
                        .toList())
                .stream()
                .collect(java.util.stream.Collectors.toMap(view -> view.id().value(), Function.identity()));
        return groups.stream()
                .map(membership -> {
                    var view = views.get(membership.group().tenantId());
                    return view == null
                            ? null
                            : new TenantMembership(
                                    view.id().value(),
                                    view.name(),
                                    membership.role().name().toLowerCase(Locale.ROOT),
                                    view.status().name().toLowerCase(Locale.ROOT));
                })
                .filter(java.util.Objects::nonNull)
                .sorted(Comparator.comparing(TenantMembership::name))
                .toList();
    }
}
