package io.space.concepts.mailoutbox.domain;

import io.space.concepts.mailoutbox.api.*;
import io.space.concepts.mailoutbox.api.MailOutboxApi;

public interface MailOutboxRepository {
    void insert(
            MailOutboxApi.MessageId id,
            MailOutboxApi.Kind kind,
            String recipient,
            String plaintextPayload,
            java.util.UUID tenantId);
}
