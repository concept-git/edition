package io.edition.control.compositions.iam.apitoken;

import static io.edition.control.compositions.iam.apitoken.ApiTokenTypes.*;

import io.edition.concepts.apitoken.api.ApiTokenApi;
import io.edition.concepts.permission.api.PermissionApi;
import io.edition.control.compositions.access.PermissionDeniedException;
import io.edition.control.compositions.access.TenantAccess;
import java.util.UUID;
import org.springframework.transaction.annotation.Transactional;

@org.springframework.stereotype.Service
public class RevokeTokenUseCase {
    private final ApiTokenApi tokens;
    private final PermissionApi permissions;
    private final TenantAccess tenants;

    RevokeTokenUseCase(ApiTokenDependencies dependencies) {
        this.tokens = dependencies.tokens;
        this.permissions = dependencies.permissions;
        this.tenants = dependencies.tenants;
    }

    @Transactional
    public void revokeToken(String credential, UUID tenant, UUID tokenId) {
        var actor = tenants.admitUser(credential, tenant);
        var token = tenants.inTenant(
                tenant,
                () -> tokens.metadata(new ApiTokenApi.TokenId(tokenId)).orElseThrow(TokenNotFoundException::new));
        if (!token.tenantId().equals(tenant)) throw new TokenNotFoundException();
        boolean owner = token.ownerId().equals(actor.principal().id());
        boolean admin =
                tenants.allows(actor, tenant, TokenRoleCeiling.chain(tenant, token.spaceId()), TenantAccess.ADMIN);
        if (!owner && !admin) throw new PermissionDeniedException();
        tenants.inTenant(tenant, () -> {
            tokens.revoke(token.id());
            permissions.clearPrincipal(new PermissionApi.Principal(
                    PermissionApi.PrincipalType.TOKEN, token.id().value()));
        });
    }
}
