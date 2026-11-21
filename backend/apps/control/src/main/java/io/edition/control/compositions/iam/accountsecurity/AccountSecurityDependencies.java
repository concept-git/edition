package io.edition.control.compositions.iam.accountsecurity;

import io.edition.concepts.mailoutbox.api.MailOutboxApi;
import io.edition.concepts.password.api.PasswordApi;
import io.edition.concepts.session.api.SessionApi;
import io.edition.concepts.user.api.UserApi;

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
