package io.edition.control.usecases.principal;

import io.edition.control.modules.managementtoken.api.ManagementTokenApi;
import io.edition.control.modules.permission.api.PermissionApi;
import io.edition.control.modules.user.api.UserApi;
import java.time.Instant;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;
import org.springframework.stereotype.Component;

/** User-bound PAT authentication is separate from space-token grants and browser sessions. */
@Component
public final class ManagementTokenPrincipalResolver implements PrincipalResolver {
    private final ManagementTokenApi tokens;
    private final UserApi users;

    public ManagementTokenPrincipalResolver(ManagementTokenApi tokens, UserApi users) {
        this.tokens = tokens;
        this.users = users;
    }

    @Override
    public Optional<Resolution> resolve(Credential credential) {
        return authenticate(credential.value())
                .map(identity -> Resolution.managedUser(
                        new PermissionApi.Principal(PermissionApi.PrincipalType.USER, identity.actorId()),
                        new ManagementCredential(
                                identity.credentialId(), identity.scopes(), identity.tenantId(), identity.expiry())));
    }

    public Optional<Identity> authenticate(String credential) {
        if (!credential.startsWith("spm_")) return Optional.empty();
        var result = tokens.authenticate(credential);
        if (!(result instanceof ManagementTokenApi.Authentication.Authenticated token)) return Optional.empty();
        var owner = users.accountProfile(new UserApi.UserId(token.ownerId()));
        if (owner.isEmpty()
                || owner.get().status() != UserApi.Status.ACTIVE
                || !owner.get().verified()) return Optional.empty();
        return Optional.of(new Identity(
                token.ownerId(),
                token.id(),
                token.scopes().stream().map(ManagementTokenApi.Scope::value).collect(Collectors.toUnmodifiableSet()),
                token.tenantId(),
                token.expiry()));
    }

    public void touch(UUID credentialId) {
        tokens.touch(credentialId);
    }

    public record Identity(UUID actorId, UUID credentialId, Set<String> scopes, UUID tenantId, Instant expiry) {
        public Identity {
            scopes = Set.copyOf(scopes);
        }
    }
}
