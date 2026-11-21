package io.edition.control.compositions.iam.accountsecurity;

import io.edition.concepts.password.api.PasswordApi;
import io.edition.concepts.session.api.SessionApi;
import io.edition.control.compositions.iam.PasswordTooWeakException;
import java.util.UUID;
import org.springframework.transaction.annotation.Transactional;

@org.springframework.stereotype.Service
public class ChangePasswordUseCase {
    private final PasswordApi passwords;
    private final SessionApi sessions;
    private final io.edition.concepts.user.api.UserApi users;

    ChangePasswordUseCase(AccountSecurityDependencies dependencies) {
        this.passwords = dependencies.passwords;
        this.sessions = dependencies.sessions;
        this.users = dependencies.users;
    }

    @Transactional(
            noRollbackFor = {
                InvalidOldPasswordException.class,
                PasswordLockedException.class,
                PasswordTooWeakException.class
            })
    public void changePassword(UUID user, String oldPassword, String newPassword) {
        try (var requestScope = io.edition.control.compositions.RequestAuditContext.entry()) {
            users.lockAccountProfile(new io.edition.concepts.user.api.UserApi.UserId(user));
            var account = new PasswordApi.AccountId(user);
            var result = passwords.change(account, oldPassword, newPassword);
            if (result instanceof PasswordApi.ChangeResult.Ok) {
                sessions.endAll(new SessionApi.HolderId(user));
            } else {
                throw PasswordFailures.changePasswordFailed(result);
            }
        }
    }
}
