package io.space.control.compositions.iam.accountsecurity;

import io.space.concepts.mailoutbox.api.MailOutboxApi;
import io.space.concepts.password.api.PasswordApi;
import io.space.concepts.user.api.UserApi;
import java.util.Locale;
import java.util.Map;
import org.springframework.transaction.annotation.Transactional;

@org.springframework.stereotype.Service
public class ForgotUseCase {
    private final PasswordApi passwords;

    private final UserApi users;
    private final MailOutboxApi mailOutbox;

    ForgotUseCase(AccountSecurityDependencies dependencies) {
        this.passwords = dependencies.passwords;
        this.users = dependencies.users;
        this.mailOutbox = dependencies.mailOutbox;
    }

    @Transactional
    public void forgot(String email) {
        try (var requestScope = io.space.control.compositions.RequestAuditContext.entry()) {
            String recipient = email.strip().toLowerCase(Locale.ROOT);
            var user = users.byEmail(recipient).orElse(null);
            if (user == null) return;
            var profile = users.lockAccountProfile(user).orElse(null);
            if (profile == null || profile.status() != UserApi.Status.ACTIVE) return;
            var account = new PasswordApi.AccountId(user.value());
            if (!passwords.isSet(account)) return;
            var issued = passwords.requestReset(account);
            mailOutbox.enqueue(
                    MailOutboxApi.Kind.PASSWORD_RESET,
                    recipient,
                    Map.of("userId", user.value().toString(), "token", issued.token()));
        }
    }
}
