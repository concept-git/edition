package io.edition.control.usecases.principal;

import io.edition.control.modules.permission.api.PermissionApi.Operation;
import io.edition.control.modules.permission.api.PermissionApi.Principal;
import io.edition.control.modules.permission.api.PermissionApi.PrincipalType;
import io.edition.control.modules.permission.api.PermissionApi.Subject;
import java.util.Objects;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

/**
 * 把外部凭据解析为 Permission 主体的扩展缝。
 * Session 与 ApiToken 在各自 issue 中分别提供实现，guard 无需知道凭据格式。
 */
@FunctionalInterface
public interface PrincipalResolver {

    Optional<Resolution> resolve(Credential credential);

    /**
     * Session 主体不额外限 scope；ApiToken 主体必须同时通过令牌 scope 与资源授权。
     */
    record Resolution(
            Principal principal,
            Optional<Set<Operation>> scopes,
            Optional<Binding> binding,
            Subject subject,
            Optional<ManagementCredential> managementCredential) {
        public Resolution(Principal principal, Optional<Set<Operation>> scopes, Optional<Binding> binding) {
            this(principal, scopes, binding, Subject.of(principal), Optional.empty());
        }

        public Resolution(
                Principal principal, Optional<Set<Operation>> scopes, Optional<Binding> binding, Subject subject) {
            this(principal, scopes, binding, subject, Optional.empty());
        }

        public Resolution {
            Objects.requireNonNull(principal, "principal");
            scopes = Objects.requireNonNull(scopes, "scopes").map(Set::copyOf);
            binding = Objects.requireNonNull(binding, "binding");
            Objects.requireNonNull(subject, "subject");
            Objects.requireNonNull(managementCredential, "managementCredential");
            if (managementCredential.isPresent() && principal.type() != PrincipalType.USER) {
                throw new IllegalArgumentException("management credential must represent a user");
            }
            if (!subject.primary().equals(principal)) {
                throw new IllegalArgumentException("subject primary must match the authenticated principal");
            }
            // API 令牌必须带 scope；会话主体不应伪装成 scoped token。
            if ((principal.type() == PrincipalType.TOKEN) != (scopes.isPresent() && binding.isPresent())) {
                throw new IllegalArgumentException("only API token principals must carry scopes and binding");
            }
        }

        public static Resolution unrestricted(Principal principal) {
            return new Resolution(principal, Optional.empty(), Optional.empty());
        }

        public static Resolution scoped(Principal principal, Set<Operation> scopes, UUID tenant, UUID space) {
            return new Resolution(principal, Optional.of(Set.copyOf(scopes)), Optional.of(new Binding(tenant, space)));
        }

        public boolean permits(Operation operation) {
            return scopes.map(allowed -> allowed.contains(operation)).orElse(true);
        }

        public Resolution withAffiliations(Set<Principal> affiliations) {
            return new Resolution(
                    principal, scopes, binding, new Subject(principal, affiliations), managementCredential);
        }

        public boolean permitsTenant(UUID tenant) {
            return managementCredential
                    .map(c -> c.tenantId() == null || c.tenantId().equals(tenant))
                    .orElse(true);
        }

        public static Resolution managedUser(Principal user, ManagementCredential credential) {
            return new Resolution(user, Optional.empty(), Optional.empty(), Subject.of(user), Optional.of(credential));
        }
    }

    record ManagementCredential(UUID id, Set<String> scopes, UUID tenantId, java.time.Instant expiry) {
        public ManagementCredential {
            Objects.requireNonNull(id);
            scopes = Set.copyOf(scopes);
            Objects.requireNonNull(expiry);
        }
    }

    record Binding(UUID tenant, UUID space) {
        public Binding {
            Objects.requireNonNull(tenant, "tenant");
            Objects.requireNonNull(space, "space");
        }
    }

    record Credential(String value) {
        public Credential {
            Objects.requireNonNull(value, "credential");
            if (value.isBlank()) {
                throw new IllegalArgumentException("credential must not be blank");
            }
        }

        @Override
        public String toString() {
            return "Credential[REDACTED]";
        }
    }
}
