package io.edition.control.usecases.platform.mailadmin;

import static io.edition.control.usecases.platform.mailadmin.MailAdminTypes.*;

import io.edition.control.modules.mailoutbox.api.MailDeliveryApi;
import io.edition.control.usecases.*;
import io.edition.control.usecases.flow.FlowResponse;
import io.edition.control.usecases.flow.IdempotentFlowExecutor;
import io.edition.control.usecases.flow.OperationNotFoundException;
import io.edition.control.usecases.principal.PrincipalResolver.Resolution;
import java.util.UUID;
import org.springframework.transaction.annotation.Transactional;

@org.springframework.stereotype.Service
public class RetryMailJobUseCase {
    private final MailDeliveryApi delivery;
    private final MailAdminAccess access;
    private final IdempotentFlowExecutor idempotency;
    private final io.edition.control.modules.audit.api.AuditApi audit;

    RetryMailJobUseCase(MailAdminDependencies dependencies) {
        this.delivery = dependencies.delivery;
        this.access = dependencies.access;
        this.idempotency = dependencies.idempotency;
        this.audit = dependencies.audit;
    }

    @Transactional
    public FlowResponse<MailJob> retryMailJob(String credential, UUID tenant, UUID messageId, String key) {
        Resolution principal = access.require(credential, tenant);
        return idempotency.execute(
                principal.principal(),
                key,
                "mail.retry",
                IdempotentFlowExecutor.canonical(tenant, messageId),
                200,
                MailJob.class,
                () -> {
                    var message = access.message(tenant, messageId);
                    if (delivery.retry(message.id()))
                        access.inScope(tenant, () -> {
                            var context = RequestAuditContext.current();
                            audit.append(new io.edition.control.modules.audit.api.AuditApi.Event(
                                    tenant,
                                    UUID.randomUUID(),
                                    context.rootId(),
                                    "fact",
                                    "user",
                                    principal.principal().id(),
                                    "Mail.retry",
                                    "mail",
                                    messageId,
                                    "ok",
                                    context.ip(),
                                    context.requestId()));
                            return null;
                        });
                    return MailJob.from(
                            delivery.view(messageId).orElseThrow(OperationNotFoundException::new), principal);
                });
    }
}
