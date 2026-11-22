package io.edition.control.modules.mailoutbox.api;

import java.util.Map;
import java.util.Objects;
import java.util.UUID;

/** 提交后邮件效果的加密持久意图接口。 */
public interface MailOutboxApi {
    MessageId enqueue(Kind kind, String recipient, Map<String, String> payload);

    enum Kind {
        VERIFICATION("verification"),
        INVITATION("invitation"),
        PASSWORD_RESET("password_reset");

        private final String value;

        Kind(String value) {
            this.value = value;
        }

        public String value() {
            return value;
        }
    }

    record MessageId(UUID value) {
        public MessageId {
            Objects.requireNonNull(value, "message id");
        }
    }
}
