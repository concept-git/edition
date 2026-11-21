package io.edition.concepts.mailoutbox.domain;

import io.edition.concepts.mailoutbox.api.*;
import io.edition.concepts.mailoutbox.api.MailOutboxApi;

public interface MailOutboxRepository {
    void insert(
            MailOutboxApi.MessageId id,
            MailOutboxApi.Kind kind,
            String recipient,
            String plaintextPayload,
            java.util.UUID tenantId);
}
