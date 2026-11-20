package io.space.control.compositions.iam.accountsecurity;

import io.space.concepts.mailoutbox.api.MailOutboxApi;
import io.space.concepts.password.api.PasswordApi;
import io.space.concepts.session.api.SessionApi;
import io.space.concepts.user.api.UserApi;

@org.springframework.stereotype.Component
final class AccountSecurityDependencies {
    final PasswordApi passwords;
    final SessionApi sessions;
    final UserApi users;
    final MailOutboxApi mailOutbox;

    AccountSecurityDependencies(PasswordApi passwords, SessionApi sessions, UserApi users, MailOutboxApi mailOutbox) {
        this.passwords = passwords;
        this.sessions = sessions;
        this.users = users;
        this.mailOutbox = mailOutbox;
    }
}
