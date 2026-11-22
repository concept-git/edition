package io.edition.control.modules.mailoutbox.domain;

import io.edition.control.modules.mailoutbox.api.*;
import io.edition.control.modules.mailoutbox.api.MailOutboxApi;

public interface MailOutboxRepository {
    void insert(
            MailOutboxApi.MessageId id,
            MailOutboxApi.Kind kind,
            String recipient,
            String plaintextPayload,
            java.util.UUID tenantId);
}
