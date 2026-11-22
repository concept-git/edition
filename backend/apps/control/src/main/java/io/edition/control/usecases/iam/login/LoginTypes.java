package io.edition.control.usecases.iam.login;

import static io.edition.control.usecases.iam.login.LoginTypes.*;

import io.edition.control.modules.session.api.SessionApi;

/** Public composition inputs, results, and finite refusal types. */
public final class LoginTypes {
    private LoginTypes() {}

    public record Credentials(
            java.util.UUID sessionId, String accessToken, String refreshToken, String tokenType, long expiresIn) {
        static Credentials from(SessionApi.Credentials value) {
            return new Credentials(
                    value.session().value(),
                    value.accessToken(),
                    value.refreshToken(),
                    value.tokenType(),
                    value.expiresIn());
        }
    }

    public record Device(String name, String browser, String os) {}
}
