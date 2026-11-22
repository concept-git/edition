package io.edition.control.usecases.iam.accountsecurity;

import io.edition.control.modules.mailoutbox.api.MailOutboxApi;
import io.edition.control.modules.password.api.PasswordApi;
import io.edition.control.modules.session.api.SessionApi;
import io.edition.control.modules.user.api.UserApi;

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
