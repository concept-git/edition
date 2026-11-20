package io.space.control.compositions.iam.accountsecurity;

import io.space.concepts.password.api.PasswordApi;
import io.space.concepts.session.api.SessionApi;
import io.space.control.compositions.iam.PasswordTooWeakException;
import java.util.UUID;
import org.springframework.transaction.annotation.Transactional;

@org.springframework.stereotype.Service
public class ChangePasswordUseCase {
    private final PasswordApi passwords;
    private final SessionApi sessions;
    private final io.space.concepts.user.api.UserApi users;

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
        try (var requestScope = io.space.control.compositions.RequestAuditContext.entry()) {
            users.lockAccountProfile(new io.space.concepts.user.api.UserApi.UserId(user));
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
