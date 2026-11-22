package io.edition.control.usecases.platform.mailadmin;

import static io.edition.control.usecases.platform.mailadmin.MailAdminTypes.*;

import io.edition.control.modules.mailoutbox.api.MailDeliveryApi;
import io.edition.control.usecases.*;
import io.edition.control.usecases.flow.IdempotentFlowExecutor;

@org.springframework.stereotype.Component
final class MailAdminDependencies {
    final MailDeliveryApi delivery;
    final MailAdminAccess access;
    final IdempotentFlowExecutor idempotency;
    final io.edition.control.modules.audit.api.AuditApi audit;

    MailAdminDependencies(
            MailDeliveryApi delivery,
            MailAdminAccess access,
            IdempotentFlowExecutor idempotency,
            io.edition.control.modules.audit.api.AuditApi audit) {
        this.delivery = delivery;
        this.access = access;
        this.idempotency = idempotency;
        this.audit = audit;
    }
}
