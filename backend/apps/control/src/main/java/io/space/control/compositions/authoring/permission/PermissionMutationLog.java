package io.space.control.compositions.authoring.permission;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.slf4j.MDC;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

/** 只在业务事务提交后记录 mutation；回滚不得留下“已完成”的误导日志。 */
@Component
class PermissionMutationLog {
    private static final Logger log = LoggerFactory.getLogger(PermissionMutationLog.class);

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    void completed(PermissionMutationEvents.MutationCompleted event) {
        var entry = log.atInfo();
        if (MDC.get("requestId") == null) entry.addKeyValue("requestId", event.requestId());
        if (MDC.get("traceId") == null) entry.addKeyValue("traceId", event.traceId());
        entry.addKeyValue("actorId", event.actorId())
                .addKeyValue("tenantId", event.tenantId())
                .addKeyValue("action", event.action())
                .addKeyValue("targetType", event.target().type())
                .addKeyValue("targetId", event.target().id())
                .addKeyValue("principalKeys", event.principalKeys())
                .addKeyValue("rootRecovery", event.rootRecovery())
                .log("permission management mutation completed");
    }
}
