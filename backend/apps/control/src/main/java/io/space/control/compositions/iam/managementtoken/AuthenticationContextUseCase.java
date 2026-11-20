package io.space.control.compositions.iam.managementtoken;

import static io.space.control.compositions.iam.managementtoken.ManagementTokenTypes.*;

import io.space.control.compositions.principal.PrincipalResolution;
import java.util.Set;
import java.util.stream.Collectors;
import org.springframework.transaction.annotation.Transactional;

@org.springframework.stereotype.Service
public class AuthenticationContextUseCase {

    private final PrincipalResolution principals;

    AuthenticationContextUseCase(ManagementTokenDependencies dependencies) {
        this.principals = dependencies.principals;
    }

    @Transactional(readOnly = true)
    public ManagementAuthenticationContext authenticationContext(String credential) {
        var resolved = principals.require(credential);
        var managed = resolved.managementCredential();
        if (managed.isPresent()) {
            var token = managed.get();
            return new ManagementAuthenticationContext(
                    "management_token",
                    resolved.principal().id(),
                    token.id(),
                    token.scopes(),
                    token.tenantId(),
                    token.expiry());
        }
        return new ManagementAuthenticationContext(
                resolved.principal().type().name().equals("USER") ? "session" : "space_token",
                resolved.principal().id(),
                resolved.binding().isPresent() ? resolved.principal().id() : null,
                resolved.scopes()
                        .map(s -> s.stream().map(op -> op.value()).collect(Collectors.toUnmodifiableSet()))
                        .orElse(Set.of()),
                resolved.binding().map(b -> b.tenant()).orElse(null),
                null);
    }
}
