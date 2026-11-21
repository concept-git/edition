package io.edition.control.compositions.iam.registration;

import io.edition.concepts.user.api.UserApi;
import java.util.UUID;

@org.springframework.stereotype.Service
public class VerifyEmailUseCase {

    private final UserApi users;

    VerifyEmailUseCase(RegistrationDependencies dependencies) {
        this.users = dependencies.users;
    }

    public void verifyEmail(UUID user, String token) {
        try (var requestScope = io.edition.control.compositions.RequestAuditContext.entry()) {
            if (users.verify(new UserApi.UserId(user), token) instanceof UserApi.VerifyResult.Rejected) {
                throw new EmailVerificationException();
            }
        }
    }
}
