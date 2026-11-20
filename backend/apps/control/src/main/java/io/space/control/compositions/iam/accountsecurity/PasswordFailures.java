package io.space.control.compositions.iam.accountsecurity;

import io.space.concepts.password.api.PasswordApi;
import io.space.control.compositions.iam.PasswordTooWeakException;

/** Shared entry policy or read projection; no independent causal invocation. */
final class PasswordFailures {

    private PasswordFailures() {}

    static RuntimeException changePasswordFailed(PasswordApi.ChangeResult rejected) {
        return switch (rejected) {
            case PasswordApi.ChangeResult.BadPassword ignored -> new InvalidOldPasswordException();
            case PasswordApi.ChangeResult.Locked locked -> new PasswordLockedException(locked.until());
            case PasswordApi.ChangeResult.TooWeak weak -> new PasswordTooWeakException(weak.violations());
            case PasswordApi.ChangeResult.Ok ignored ->
                throw new IllegalArgumentException("successful change is not a failure");
        };
    }

    static RuntimeException resetInvalid(PasswordApi.ResetResult rejected) {
        return switch (rejected) {
            case PasswordApi.ResetResult.TokenInvalid ignored -> new ResetTokenInvalidException();
            case PasswordApi.ResetResult.TooWeak weak -> new PasswordTooWeakException(weak.violations());
            case PasswordApi.ResetResult.Ok ignored ->
                throw new IllegalArgumentException("successful reset is not a failure");
        };
    }
}
