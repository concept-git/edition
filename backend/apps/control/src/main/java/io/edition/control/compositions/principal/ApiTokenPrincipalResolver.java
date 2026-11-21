package io.edition.control.compositions.principal;

import io.edition.concepts.apitoken.api.ApiTokenApi;
import io.edition.concepts.permission.api.PermissionApi;
import io.edition.concepts.tenantregistry.api.TenantScopeApi;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;
import org.springframework.stereotype.Component;

/** spc_ Bearer -> 独立 TOKEN principal；bootstrap 查询只按 secret 内 UUID 精确定位。 */
@Component
public final class ApiTokenPrincipalResolver implements PrincipalResolver {
    private final ApiTokenApi tokens;
    private final TenantScopeApi tenantScope;

    ApiTokenPrincipalResolver(ApiTokenApi tokens, TenantScopeApi tenantScope) {
        this.tokens = tokens;
        this.tenantScope = tenantScope;
    }

    @Override
    public Optional<Resolution> resolve(Credential credential) {
        if (!credential.value().startsWith("spc_")) return Optional.empty();
        ApiTokenApi.Authentication result = tenantScope.withoutTenant(
                TenantScopeApi.BootstrapReason.TOKEN_RESOLUTION, () -> tokens.authenticate(credential.value()));
        if (!(result instanceof ApiTokenApi.Authentication.Authenticated authenticated)) {
            return Optional.empty();
        }
        var scopes = authenticated.scopes().stream()
                .map(scope -> new PermissionApi.Operation(scope.value()))
                .collect(Collectors.toUnmodifiableSet());
        return Optional.of(Resolution.scoped(
                new PermissionApi.Principal(
                        PermissionApi.PrincipalType.TOKEN, authenticated.token().value()),
                scopes,
                authenticated.tenant(),
                authenticated.space()));
    }

    /** Spring Security 入口只需要稳定 token id，不向 gateway 暴露 Permission 类型。 */
    public Optional<UUID> authenticate(String credential) {
        return resolve(new Credential(credential))
                .map(resolution -> resolution.principal().id());
    }
}
