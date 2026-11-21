package io.edition.control.compositions.platform.mailadmin;

import static io.edition.control.compositions.platform.mailadmin.MailAdminTypes.*;

import io.edition.concepts.mailoutbox.api.MailDeliveryApi;
import io.edition.control.compositions.*;
import io.edition.control.compositions.flow.IdempotentFlowExecutor;

@org.springframework.stereotype.Component
final class MailAdminDependencies {
    final MailDeliveryApi delivery;
    final MailAdminAccess access;
    final IdempotentFlowExecutor idempotency;
    final io.edition.concepts.audit.api.AuditApi audit;

    MailAdminDependencies(
            MailDeliveryApi delivery,
            MailAdminAccess access,
            IdempotentFlowExecutor idempotency,
            io.edition.concepts.audit.api.AuditApi audit) {
        this.delivery = delivery;
        this.access = access;
        this.idempotency = idempotency;
        this.audit = audit;
    }
}
