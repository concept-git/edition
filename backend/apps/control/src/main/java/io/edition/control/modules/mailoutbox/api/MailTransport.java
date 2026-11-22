package io.edition.control.modules.mailoutbox.api;

import java.util.UUID;

public interface MailTransport {
    void send(UUID messageId, String recipient, String subject, String text);
}
