package io.edition.control.compositions.platform.tenant;

import static io.edition.control.compositions.platform.tenant.TenantTypes.*;

import io.edition.concepts.membership.api.MembershipApi.Group;
import io.edition.concepts.membership.api.MembershipApi.MemberId;
import io.edition.concepts.tenantregistry.api.TenantRegistryApi;
import io.edition.concepts.tenantregistry.api.TenantRegistryApi.ProvisionResult;
import io.edition.concepts.tenantregistry.api.TenantScopeApi;
import io.edition.concepts.tenantregistry.api.TenantScopeApi.BootstrapReason;
import io.edition.concepts.user.api.UserApi;
import io.edition.control.compositions.access.PlatformOperatorGuard;
import java.util.Optional;
import org.springframework.transaction.annotation.Transactional;

@org.springframework.stereotype.Service
public class ProvisionTenantUseCase {
    private final TenantRelay relay;

    private final PlatformOperatorGuard platformOperator;
    private final TenantRegistryApi tenants;
    private final TenantScopeApi tenantScope;

    private final UserApi users;

    ProvisionTenantUseCase(TenantDependencies dependencies) {
        this.relay = dependencies.relay;
        this.platformOperator = dependencies.platformOperator;
        this.tenants = dependencies.tenants;
        this.tenantScope = dependencies.tenantScope;
        this.users = dependencies.users;
    }

    @Transactional
    public Provisioned provisionTenant(String credential, String name, String ownerEmail) {
        try (var requestScope = io.edition.control.compositions.RequestAuditContext.entry()) {
            platformOperator.require(credential);
            // 登记处的写入天生没有租户上下文：租户行此刻才诞生（CONCEPT.md § 租户上下文与 RLS）。
            TenantRegistryApi.View tenant = tenantScope.withoutTenant(
                    BootstrapReason.TENANT_PROVISIONING, () -> switch (tenants.provision(name)) {
                        case ProvisionResult.InvalidName invalid ->
                            throw new TenantNameInvalidException(invalid.reason());
                        case ProvisionResult.Provisioned ok -> ok.tenant();
                    });

            // owner 必须是已验证且在用的账号，否则只能走邀请路径。
            Optional<MemberId> seatable = users.byEmail(ownerEmail)
                    .filter(user -> users.isActive(user)
                            && users.profile(user)
                                    .map(UserApi.Profile::verified)
                                    .orElse(false))
                    .map(user -> new MemberId(user.value()));

            Group group = Group.tenant(tenant.id().value());
            return tenantScope.inTenant(
                    tenant.id(),
                    () -> seatable.map(owner -> relay.seatOwner(group, owner, tenant))
                            .orElseGet(() -> relay.inviteOwner(group, ownerEmail, tenant)));
        }
    }
}
