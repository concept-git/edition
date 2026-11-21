package io.edition.concepts.mailoutbox.adapters.persistence;

import io.edition.concepts.mailoutbox.api.*;
import io.edition.concepts.mailoutbox.api.MailOutboxApi;
import io.edition.concepts.mailoutbox.domain.MailOutboxRepository;
import org.springframework.stereotype.Repository;

@Repository
class MyBatisMailOutboxRepository implements MailOutboxRepository {
    private final MailOutboxMapper mapper;
    private final MailOutboxCipher cipher;

    MyBatisMailOutboxRepository(MailOutboxMapper mapper, MailOutboxCipher cipher) {
        this.mapper = mapper;
        this.cipher = cipher;
    }

    @Override
    public void insert(
            MailOutboxApi.MessageId id,
            MailOutboxApi.Kind kind,
            String recipient,
            String plaintextPayload,
            java.util.UUID tenantId) {
        mapper.insert(
                id.value(), kind.value(), recipient, cipher.encrypt(id, kind, recipient, plaintextPayload), tenantId);
    }
}
