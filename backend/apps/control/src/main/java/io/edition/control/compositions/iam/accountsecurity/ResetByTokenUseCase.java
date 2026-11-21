package io.edition.control.compositions.iam.accountsecurity;

import io.edition.concepts.password.api.PasswordApi;
import io.edition.concepts.session.api.SessionApi;
import io.edition.control.compositions.iam.PasswordTooWeakException;
import org.springframework.transaction.annotation.Transactional;

@org.springframework.stereotype.Service
public class ResetByTokenUseCase {
    private final PasswordApi passwords;
    private final SessionApi sessions;
    private final io.edition.concepts.user.api.UserApi users;

    ResetByTokenUseCase(AccountSecurityDependencies dependencies) {
        this.passwords = dependencies.passwords;
        this.sessions = dependencies.sessions;
        this.users = dependencies.users;
    }

    @Transactional(noRollbackFor = {ResetTokenInvalidException.class, PasswordTooWeakException.class})
    public void resetByToken(String token, String newPassword) {
        try (var requestScope = io.edition.control.compositions.RequestAuditContext.entry()) {
            passwords
                    .resetOwner(token)
                    .ifPresent(user ->
                            users.lockAccountProfile(new io.edition.concepts.user.api.UserApi.UserId(user.value())));
            var result = passwords.reset(token, newPassword);
            if (result instanceof PasswordApi.ResetResult.Ok ok) {
                sessions.endAll(new SessionApi.HolderId(ok.user().value()));
            } else {
                throw PasswordFailures.resetInvalid(result);
            }
        }
    }
}
