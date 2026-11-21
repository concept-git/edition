package io.edition.concepts.mailoutbox.adapters.smtp;

import io.edition.concepts.mailoutbox.api.*;
import io.edition.concepts.mailoutbox.api.MailTransport;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.mail.MailParseException;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Component;

@Component
@ConditionalOnProperty(name = "io.edition.mail-outbox.enabled", havingValue = "true")
final class SmtpMailTransport implements MailTransport {
    private final JavaMailSender sender;
    private final String from;

    SmtpMailTransport(JavaMailSender sender, @Value("${io.edition.mail-outbox.from}") String from) {
        if (from.isBlank() || from.contains("\r") || from.contains("\n"))
            throw new IllegalArgumentException("mail sender required");
        this.sender = sender;
        this.from = from;
    }

    @Override
    public void send(UUID messageId, String recipient, String subject, String text) {
        var message = sender.createMimeMessage();
        try {
            var helper = new MimeMessageHelper(message, "UTF-8");
            helper.setFrom(from);
            helper.setTo(recipient);
            helper.setSubject(subject);
            helper.setText(text, false);
            message.setHeader("Message-ID", "<" + messageId + "@space.mail>");
            message.setHeader("X-Edition-Event-Id", messageId.toString());
        } catch (jakarta.mail.MessagingException invalid) {
            throw new MailParseException("mail template invalid", invalid);
        }
        sender.send(message);
    }
}
