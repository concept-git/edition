package io.edition.control.usecases.authoring.permission;

import java.util.List;
import java.util.UUID;

/** 权限管理成功 mutation 的结构化 flow event；只携稳定身份，不携姓名、邮箱等 PII。 */
public final class PermissionMutationEvents {
    private PermissionMutationEvents() {}

    public enum Action {
        GRANT_PUT,
        GRANT_DELETE,
        RESTRICTION_PUT,
        RESTRICTION_DELETE
    }

    public record Target(String type, UUID id) {}

    public record MutationCompleted(
            UUID actorId,
            UUID tenantId,
            Action action,
            Target target,
            List<String> principalKeys,
            String requestId,
            String traceId,
            boolean rootRecovery) {
        public MutationCompleted {
            principalKeys = List.copyOf(principalKeys);
        }
    }
}
