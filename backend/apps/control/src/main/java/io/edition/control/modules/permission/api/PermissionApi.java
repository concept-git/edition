package io.edition.control.modules.permission.api;

import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

/**
 * Permission 概念的唯一对外门面。
 * Resource 与 Principal 都是稳定身份；地址变化频繁，因此这里永远不接受 slug 或路径。
 */
public interface PermissionApi {

    void defineRole(Role role, Set<Operation> operations);

    void grant(Resource resource, Principal principal, Role role);

    void revoke(Resource resource, Principal principal);

    RestrictResult restrict(Resource resource, Set<Principal> principals, long expectedRevision);

    UnrestrictResult unrestrict(Resource resource, long expectedRevision);

    void clearResource(Resource resource);

    void clearPrincipal(Principal principal);

    Set<UUID> tenantIdsOf(Principal principal);

    Decision decide(List<Resource> chain, Principal principal, Operation operation);

    Decision decide(List<Resource> chain, Subject subject, Operation operation);

    Decision decideFresh(List<Resource> chain, Principal principal, Operation operation);

    Set<List<Resource>> filterFresh(Set<List<Resource>> chains, Principal principal, Operation operation);

    Set<List<Resource>> filterFresh(Set<List<Resource>> chains, Subject subject, Operation operation);

    Set<List<Resource>> filter(Set<List<Resource>> chains, Principal principal, Operation operation);

    Set<List<Resource>> filter(Set<List<Resource>> chains, Subject subject, Operation operation);

    Optional<Role> effectiveRole(List<Resource> chain, Principal principal);

    /** Role 对应的 Operation 集；sync 用集合包含关系判断授权上限。 */
    Set<Operation> operations(Role role);

    RestrictionView restriction(Resource resource);

    Map<Resource, RestrictionView> restrictions(Set<Resource> resources);

    GrantPage grants(Set<Resource> resources, String cursor, int limit);

    Policy snapshot();

    record Policy(List<Grant> grants, Map<Resource, RestrictionView> restrictions) {
        public Policy {
            grants = List.copyOf(grants);
            restrictions = Map.copyOf(restrictions);
        }
    }

    record Resource(ResourceType type, UUID id) {
        public Resource {
            Objects.requireNonNull(type, "resource type");
            Objects.requireNonNull(id, "resource id");
        }
    }

    enum ResourceType {
        /** 判定链最外层：租户 admin 由此继承下层管理权，可被下层 grant/restrict 覆盖。 */
        TENANT("tenant"),
        TEAM("team"),
        SITE("site"),
        SPACE("space"),
        PAGE("page");

        private final String value;

        ResourceType(String value) {
            this.value = value;
        }

        public String value() {
            return value;
        }
    }

    record Principal(PrincipalType type, UUID id) {
        public Principal {
            Objects.requireNonNull(type, "principal type");
            // anonymous 是一个真实的可授权主体，但它没有对应实体 id；其余主体必须可稳定追踪。
            if ((type == PrincipalType.ANONYMOUS) != (id == null)) {
                throw new IllegalArgumentException("only anonymous has no principal id");
            }
        }

        public static Principal anonymous() {
            return new Principal(PrincipalType.ANONYMOUS, null);
        }
    }

    enum PrincipalType {
        USER("user"),
        TEAM("team"),
        TOKEN("token"),
        ANONYMOUS("anonymous");

        private final String value;

        PrincipalType(String value) {
            this.value = value;
        }

        public String value() {
            return value;
        }
    }

    record Role(String value) {
        public Role {
            value = requireName(value, "role");
        }
    }

    record Operation(String value) {
        public Operation {
            value = requireName(value, "operation");
        }
    }

    /**
     * 一次判定使用的主体闭包。primary 是发起调用的主体，affiliations 是其当前所属、同样可被授权的主体。
     */
    record Subject(Principal primary, Set<Principal> affiliations) {
        public Subject {
            Objects.requireNonNull(primary, "primary principal");
            Objects.requireNonNull(affiliations, "affiliations");
            var normalized = new LinkedHashSet<>(affiliations);
            normalized.remove(primary);
            affiliations = Set.copyOf(normalized);
        }

        public static Subject of(Principal principal) {
            return new Subject(principal, Set.of());
        }

        public Set<Principal> identities() {
            var identities = new LinkedHashSet<Principal>();
            identities.add(primary);
            identities.addAll(affiliations);
            return Set.copyOf(identities);
        }
    }

    record Grant(Resource resource, Principal principal, Role role) {
        public Grant {
            Objects.requireNonNull(resource, "grant resource");
            Objects.requireNonNull(principal, "grant principal");
            Objects.requireNonNull(role, "grant role");
        }
    }

    record GrantPage(List<Grant> items, String nextCursor) {
        public GrantPage {
            items = List.copyOf(Objects.requireNonNull(items, "grant page items"));
        }
    }

    record RestrictionView(boolean active, Set<Principal> principals, long revision) {
        public RestrictionView {
            principals = Set.copyOf(Objects.requireNonNull(principals, "restriction principals"));
            if (revision < 0) {
                throw new IllegalArgumentException("restriction revision must not be negative");
            }
            if (!active && !principals.isEmpty()) {
                throw new IllegalArgumentException("an inactive restriction cannot retain principals");
            }
        }

        public static RestrictionView inactive(long revision) {
            return new RestrictionView(false, Set.of(), revision);
        }
    }

    sealed interface RestrictResult {
        record Restricted(RestrictionView restriction) implements RestrictResult {
            public Restricted {
                Objects.requireNonNull(restriction, "restriction");
            }
        }

        record Conflict(RestrictionView current) implements RestrictResult {
            public Conflict {
                Objects.requireNonNull(current, "current restriction");
            }
        }
    }

    sealed interface UnrestrictResult {
        record Unrestricted(RestrictionView restriction) implements UnrestrictResult {
            public Unrestricted {
                Objects.requireNonNull(restriction, "restriction");
            }
        }

        record Conflict(RestrictionView current) implements UnrestrictResult {
            public Conflict {
                Objects.requireNonNull(current, "current restriction");
            }
        }
    }

    record DecisionTrace(
            Resource resource,
            List<Grant> subjectGrants,
            RestrictionView restriction,
            Set<Principal> restrictionMatches,
            boolean restrictionSatisfied,
            boolean decisive) {
        public DecisionTrace {
            Objects.requireNonNull(resource, "trace resource");
            subjectGrants = List.copyOf(Objects.requireNonNull(subjectGrants, "subject grants"));
            Objects.requireNonNull(restriction, "restriction");
            restrictionMatches = Set.copyOf(Objects.requireNonNull(restrictionMatches, "restriction matches"));
        }
    }

    record Decision(
            boolean allowed,
            Optional<Role> effectiveRole,
            Set<Operation> effectiveOperations,
            List<Grant> matchedGrants,
            List<DecisionTrace> trace) {
        public Decision {
            effectiveRole = Objects.requireNonNull(effectiveRole, "effective role");
            effectiveOperations = Set.copyOf(Objects.requireNonNull(effectiveOperations, "effective operations"));
            matchedGrants = List.copyOf(Objects.requireNonNull(matchedGrants, "matched grants"));
            trace = List.copyOf(Objects.requireNonNull(trace, "decision trace"));
        }
    }

    private static String requireName(String value, String label) {
        Objects.requireNonNull(value, label);
        String normalized = value.strip().toLowerCase(Locale.ROOT);
        if (normalized.isEmpty()) {
            throw new IllegalArgumentException(label + " must not be blank");
        }
        return normalized;
    }
}
