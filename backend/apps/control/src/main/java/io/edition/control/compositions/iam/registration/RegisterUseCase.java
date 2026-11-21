package io.edition.control.compositions.iam.registration;

import io.edition.concepts.mailoutbox.api.MailOutboxApi;
import io.edition.concepts.password.api.PasswordApi;
import io.edition.concepts.user.api.UserApi;
import io.edition.control.compositions.iam.PasswordTooWeakException;
import java.util.Map;
import java.util.UUID;
import org.springframework.transaction.annotation.Transactional;

@org.springframework.stereotype.Service
public class RegisterUseCase {
    private final RegistrationRelay relay;
    private final UserApi users;
    private final PasswordApi passwords;

    private final MailOutboxApi mailOutbox;

    RegisterUseCase(RegistrationDependencies dependencies) {
        this.relay = dependencies.relay;
        this.users = dependencies.users;
        this.passwords = dependencies.passwords;
        this.mailOutbox = dependencies.mailOutbox;
    }

    @Transactional
    public UUID register(String email, String name, String password) {
        try (var requestScope = io.edition.control.compositions.RequestAuditContext.entry()) {
            var registered =
                    switch (users.register(email, name)) {
                        case UserApi.RegisterResult.EmailTaken taken -> throw new EmailTakenException(taken.email());
                        case UserApi.RegisterResult.Registered ok -> ok;
                    };
            UUID user =
                    switch (passwords.set(
                            new PasswordApi.AccountId(registered.user().value()), password)) {
                        case PasswordApi.SetResult.TooWeak weak ->
                            throw new PasswordTooWeakException(weak.violations());
                        case PasswordApi.SetResult.Ok ok -> registered.user().value();
                    };
            relay.acceptInviteOnRegister(user, email);
            mailOutbox.enqueue(
                    MailOutboxApi.Kind.VERIFICATION,
                    email,
                    Map.of("userId", user.toString(), "token", registered.verifyToken()));
            return user;
        }
    }
}
