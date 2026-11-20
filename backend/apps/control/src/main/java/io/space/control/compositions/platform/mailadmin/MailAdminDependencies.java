package io.space.control.compositions.platform.mailadmin;

import static io.space.control.compositions.platform.mailadmin.MailAdminTypes.*;

import io.space.concepts.mailoutbox.api.MailDeliveryApi;
import io.space.control.compositions.*;
import io.space.control.compositions.flow.IdempotentFlowExecutor;

@org.springframework.stereotype.Component
final class MailAdminDependencies {
    final MailDeliveryApi delivery;
    final MailAdminAccess access;
    final IdempotentFlowExecutor idempotency;
    final io.space.concepts.audit.api.AuditApi audit;

    MailAdminDependencies(
            MailDeliveryApi delivery,
            MailAdminAccess access,
            IdempotentFlowExecutor idempotency,
            io.space.concepts.audit.api.AuditApi audit) {
        this.delivery = delivery;
        this.access = access;
        this.idempotency = idempotency;
        this.audit = audit;
    }
}
