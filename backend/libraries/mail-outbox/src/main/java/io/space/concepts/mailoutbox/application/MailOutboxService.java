package io.space.concepts.mailoutbox.application;

import io.space.concepts.mailoutbox.api.*;
import io.space.concepts.mailoutbox.api.MailOutboxApi;
import io.space.concepts.mailoutbox.domain.MailOutboxRepository;
import java.util.Map;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tools.jackson.core.JacksonException;
import tools.jackson.databind.json.JsonMapper;

@Service
class MailOutboxService implements MailOutboxApi {
    private final MailOutboxRepository repository;
    private final JsonMapper json;

    MailOutboxService(MailOutboxRepository repository, JsonMapper json) {
        this.repository = repository;
        this.json = json;
    }

    @Override
    @Transactional
    public MessageId enqueue(Kind kind, String recipient, Map<String, String> payload) {
        if (recipient == null || recipient.isBlank()) throw new IllegalArgumentException("recipient is required");
        var id = new MessageId(UUID.randomUUID());
        try {
            repository.insert(
                    id,
                    kind,
                    recipient.strip(),
                    json.writeValueAsString(Map.copyOf(payload)),
                    payload.containsKey("tenantId") ? UUID.fromString(payload.get("tenantId")) : null);
        } catch (JacksonException failure) {
            throw new IllegalStateException("failed to serialize mail outbox payload", failure);
        }
        return id;
    }
}
