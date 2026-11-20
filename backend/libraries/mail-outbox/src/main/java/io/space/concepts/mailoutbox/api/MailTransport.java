package io.space.concepts.mailoutbox.api;

import java.util.UUID;

public interface MailTransport {
    void send(UUID messageId, String recipient, String subject, String text);
}
