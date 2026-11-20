package io.space.control.compositions.platform.maildelivery;

import io.space.concepts.mailoutbox.api.MailDeliveryApi;
import io.space.concepts.mailoutbox.api.MailTransport;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;

@ConditionalOnProperty(name = "io.space.mail-outbox.enabled", havingValue = "true")
@org.springframework.stereotype.Component
final class MailDeliveryDependencies {
    static final org.slf4j.Logger LOG = org.slf4j.LoggerFactory.getLogger(DeliverMailOnSchedule.class);
    final MailDeliveryApi delivery;
    final MailEligibility eligibility;
    final MailTransport transport;
    final MailTemplates templates;
    final io.micrometer.core.instrument.MeterRegistry metrics;

    MailDeliveryDependencies(
            MailDeliveryApi delivery,
            MailEligibility eligibility,
            MailTransport transport,
            MailTemplates templates,
            io.micrometer.core.instrument.MeterRegistry metrics) {
        this.delivery = delivery;
        this.eligibility = eligibility;
        this.transport = transport;
        this.templates = templates;
        this.metrics = metrics;
    }
}
