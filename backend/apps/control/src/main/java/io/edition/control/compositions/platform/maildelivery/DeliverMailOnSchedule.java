package io.edition.control.compositions.platform.maildelivery;

import io.edition.concepts.mailoutbox.api.MailDeliveryApi;
import io.edition.concepts.mailoutbox.api.MailTransport;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.mail.MailAuthenticationException;
import org.springframework.mail.MailException;
import org.springframework.mail.MailParseException;
import org.springframework.scheduling.annotation.Scheduled;

@ConditionalOnProperty(name = "io.edition.mail-outbox.enabled", havingValue = "true")
@org.springframework.stereotype.Service
public class DeliverMailOnSchedule {
    private static final org.slf4j.Logger LOG = MailDeliveryDependencies.LOG;
    private final MailDeliveryApi delivery;
    private final MailEligibility eligibility;
    private final MailTransport transport;
    private final MailTemplates templates;
    private final io.micrometer.core.instrument.MeterRegistry metrics;

    DeliverMailOnSchedule(MailDeliveryDependencies dependencies) {
        this.delivery = dependencies.delivery;
        this.eligibility = dependencies.eligibility;
        this.transport = dependencies.transport;
        this.templates = dependencies.templates;
        this.metrics = dependencies.metrics;
    }

    @Scheduled(
            initialDelayString = "${io.edition.mail-outbox.initial-delay-ms:0}",
            fixedDelayString = "${io.edition.mail-outbox.poll-ms:1000}")
    public void deliverMail() {
        var claimed = delivery.claim();
        if (claimed.isEmpty()) return;
        var lease = claimed.orElseThrow();
        java.util.Map<String, String> payload;
        try {
            payload = delivery.payload(lease);
        } catch (IllegalStateException | tools.jackson.core.JacksonException failure) {
            delivery.failed(lease, "payload_unreadable", false);
            metrics.counter("edition.mail.deliveries", "outcome", "payload_unreadable")
                    .increment();
            LOG.error("mail delivery payload unreadable messageId={}", lease.id());
            return;
        }
        try {
            if (!eligibility.valid(lease, payload)) {
                delivery.obsolete(lease);
                metrics.counter("edition.mail.deliveries", "outcome", "obsolete")
                        .increment();
                return;
            }
            if (payload.containsKey("mailText") != payload.containsKey("mailSubject"))
                throw new IllegalStateException("incomplete frozen mail");
            var content = payload.containsKey("mailText") && payload.containsKey("mailSubject")
                    ? new MailTemplates.Content(payload.get("mailSubject"), payload.get("mailText"))
                    : templates.render(lease.kind(), payload);
            var frozen = new java.util.HashMap<>(payload);
            frozen.put("mailSubject", content.subject());
            frozen.put("mailText", content.text());
            if (!delivery.prepare(lease, frozen)) return;
            transport.send(lease.id(), lease.recipient(), content.subject(), content.text());
            delivery.accepted(lease);
            metrics.counter("edition.mail.deliveries", "outcome", "accepted").increment();
        } catch (MailAuthenticationException | MailParseException configuration) {
            delivery.failed(lease, "mail_configuration", false);
            metrics.counter("edition.mail.deliveries", "outcome", "configuration")
                    .increment();
        } catch (MailException
                | org.springframework.dao.TransientDataAccessException
                | org.springframework.dao.DataAccessResourceFailureException
                | org.springframework.dao.RecoverableDataAccessException dependency) {
            delivery.failed(lease, "dependency_unavailable", true);
            metrics.counter("edition.mail.deliveries", "outcome", "dependency_unavailable")
                    .increment();
        } catch (IllegalStateException
                | IllegalArgumentException
                | NullPointerException
                | org.springframework.dao.NonTransientDataAccessException unexpected) {
            delivery.failed(lease, "unexpected", false);
            metrics.counter("edition.mail.deliveries", "outcome", "unexpected").increment();
            LOG.error("mail delivery invariant failed messageId={}", lease.id());
        }
    }
}
