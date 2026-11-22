package io.edition.control.modules.customdomain.api;

import java.time.Instant;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.UUID;

/** CustomDomain 概念唯一出口。调用方负责建立 tenant scope；`_resolve` 走窄函数、可不设租户。 */
public interface CustomDomainApi {
    String CHALLENGE_PREFIX = "_space-challenge.";

    BindResult bind(String host, UUID target);

    VerifyResult verify(String host, String dnsToken);

    SetPrimaryResult setPrimary(String host);

    UnbindResult unbind(String host);

    Optional<Resolved> resolve(String host);

    List<View> hostsOf(UUID target);

    List<View> activeHostsOf(UUID target);
    /** 多目标键集分页（host asc，host 全局唯一）；targets 为空返回空页；非法 cursor 抛 IllegalArgumentException。 */
    Page page(java.util.Set<UUID> targets, String cursor, int limit);

    Optional<String> primaryOf(UUID target);

    record Page(List<View> items, String nextCursor) {
        public Page {
            items = List.copyOf(items);
        }
    }

    record View(String host, UUID target, boolean verified, boolean isPrimary, String dnsToken, Instant createdAt) {
        public View {
            Objects.requireNonNull(host, "host");
            Objects.requireNonNull(target, "target");
            Objects.requireNonNull(dnsToken, "dns token");
            Objects.requireNonNull(createdAt, "created at");
        }

        public String txtName() {
            return CHALLENGE_PREFIX + host;
        }

        public String txtValue() {
            return dnsToken;
        }
    }

    record Resolved(UUID target, UUID tenantId, boolean isPrimary) {
        public Resolved {
            Objects.requireNonNull(target, "target");
            Objects.requireNonNull(tenantId, "tenant id");
        }
    }

    sealed interface BindResult {
        record Bound(View domain) implements BindResult {}

        record Taken() implements BindResult {}

        record HostInvalid() implements BindResult {}
    }

    sealed interface VerifyResult {
        record Verified(View domain) implements VerifyResult {}

        record NotFound() implements VerifyResult {}

        record NotProven() implements VerifyResult {}

        record HostInvalid() implements VerifyResult {}
    }

    sealed interface SetPrimaryResult {
        record Changed(View domain) implements SetPrimaryResult {}

        record NotFound() implements SetPrimaryResult {}

        record NotVerified() implements SetPrimaryResult {}

        record HostInvalid() implements SetPrimaryResult {}
    }

    sealed interface UnbindResult {
        record Unbound() implements UnbindResult {}

        record HostInvalid() implements UnbindResult {}
    }
}
