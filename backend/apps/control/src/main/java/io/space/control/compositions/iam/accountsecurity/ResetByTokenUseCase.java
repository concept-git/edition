package io.space.control.compositions.iam.accountsecurity;

import io.space.concepts.password.api.PasswordApi;
import io.space.concepts.session.api.SessionApi;
import io.space.control.compositions.iam.PasswordTooWeakException;
import org.springframework.transaction.annotation.Transactional;

@org.springframework.stereotype.Service
public class ResetByTokenUseCase {
    private final PasswordApi passwords;
    private final SessionApi sessions;
    private final io.space.concepts.user.api.UserApi users;

    ResetByTokenUseCase(AccountSecurityDependencies dependencies) {
        this.passwords = dependencies.passwords;
        this.sessions = dependencies.sessions;
        this.users = dependencies.users;
    }

    @Transactional(noRollbackFor = {ResetTokenInvalidException.class, PasswordTooWeakException.class})
    public void resetByToken(String token, String newPassword) {
        try (var requestScope = io.space.control.compositions.RequestAuditContext.entry()) {
            passwords
                    .resetOwner(token)
                    .ifPresent(user ->
                            users.lockAccountProfile(new io.space.concepts.user.api.UserApi.UserId(user.value())));
            var result = passwords.reset(token, newPassword);
            if (result instanceof PasswordApi.ResetResult.Ok ok) {
                sessions.endAll(new SessionApi.HolderId(ok.user().value()));
            } else {
                throw PasswordFailures.resetInvalid(result);
            }
        }
    }
}
