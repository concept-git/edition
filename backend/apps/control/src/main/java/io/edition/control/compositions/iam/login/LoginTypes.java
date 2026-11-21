package io.edition.control.compositions.iam.login;

import static io.edition.control.compositions.iam.login.LoginTypes.*;

import io.edition.concepts.session.api.SessionApi;

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
