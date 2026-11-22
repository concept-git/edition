package io.edition.control.usecases.iam.registration;

import io.edition.control.modules.mailoutbox.api.MailOutboxApi;
import io.edition.control.modules.user.api.UserApi;
import java.util.Locale;
import java.util.Map;
import org.springframework.transaction.annotation.Transactional;

@org.springframework.stereotype.Service
public class ResendVerificationUseCase {

    private final UserApi users;

    private final MailOutboxApi mailOutbox;

    ResendVerificationUseCase(RegistrationDependencies dependencies) {
        this.users = dependencies.users;
        this.mailOutbox = dependencies.mailOutbox;
    }

    @Transactional
    public void resendVerification(String email) {
        try (var requestScope = io.edition.control.usecases.RequestAuditContext.entry()) {
            String recipient = email.strip().toLowerCase(Locale.ROOT);
            users.byEmail(recipient)
                    .ifPresent(user -> users.requestVerification(user).ifPresent(challenge -> {
                        mailOutbox.enqueue(
                                MailOutboxApi.Kind.VERIFICATION,
                                recipient,
                                Map.of("userId", user.value().toString(), "token", challenge.token()));
                    }));
        }
    }
}
