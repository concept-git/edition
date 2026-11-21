package io.edition.concepts.mailoutbox.adapters.persistence;

import io.edition.concepts.mailoutbox.api.*;
import java.util.UUID;
import org.apache.ibatis.annotations.Insert;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
interface MailOutboxMapper {
    @Insert("""
            insert into shared.mail_outbox (id, kind, recipient, encrypted_payload, tenant_id)
            values (#{id}, #{kind}, #{recipient}, #{encryptedPayload}, #{tenantId})
            """)
    void insert(
            @Param("id") UUID id,
            @Param("kind") String kind,
            @Param("recipient") String recipient,
            @Param("encryptedPayload") String encryptedPayload,
            @Param("tenantId") UUID tenantId);
}
