package io.edition.control.compositions.iam.usererasure;

import io.edition.concepts.password.api.PasswordApi;
import io.edition.concepts.user.api.UserApi;
import io.edition.control.compositions.access.PlatformOperatorGuard;
import io.edition.control.compositions.principal.PrincipalResolution;
import java.util.Locale;
import org.springframework.stereotype.Component;

/** 本人或运营员的身份与二次确认；密码失败计数由入口的事务规则保留。 */
@Component
final class UserErasureAccess {
    private final UserDirectory directory;
    private final UserApi users;
    private final PasswordApi passwords;
    private final PlatformOperatorGuard platformOperators;
    private final PrincipalResolution principals;

    UserErasureAccess(
            UserDirectory directory,
            UserApi users,
            PasswordApi passwords,
            PlatformOperatorGuard platformOperators,
            PrincipalResolution principals) {
        this.directory = directory;
        this.users = users;
        this.passwords = passwords;
        this.platformOperators = platformOperators;
        this.principals = principals;
    }

    UserApi.UserId requireOperator(String credential) {
        return platformOperators.require(credential);
    }

    /** 本人注销只接受自然人会话：机器主体没有"本人"。 */
    UserApi.UserId resolveSelf(String credential) {
        return new UserApi.UserId(principals.requireUser(credential));
    }

    void confirmSelf(UserApi.UserId user, String confirmationEmail, String currentPassword) {
        users.lockAccountProfile(user);
        UserApi.AccountProfile profile = directory.profile(user);
        confirmPassword(user, currentPassword);
        if (!sameEmail(profile.email(), confirmationEmail)) {
            throw new UserErasureTypes.EraseConfirmationInvalidException();
        }
    }

    void confirmOperatorAction(
            UserApi.UserId operator,
            UserApi.UserId target,
            String confirmationEmail,
            String currentPassword,
            boolean allowErasedTarget) {
        java.util.stream.Stream.of(operator, target)
                .distinct()
                .sorted(java.util.Comparator.comparing(UserApi.UserId::value))
                .forEach(users::lockAccountProfile);
        UserApi.AccountProfile profile = directory.profile(target);
        confirmPassword(operator, currentPassword);
        if (!(allowErasedTarget && profile.status() == UserApi.Status.ERASED)
                && !sameEmail(profile.email(), confirmationEmail)) {
            throw new UserErasureTypes.EraseConfirmationInvalidException();
        }
    }

    private void confirmPassword(UserApi.UserId user, String currentPassword) {
        if (!(passwords.authenticate(new PasswordApi.AccountId(user.value()), currentPassword)
                instanceof PasswordApi.AuthenticateResult.Authenticated)) {
            throw new UserErasureTypes.EraseConfirmationInvalidException();
        }
    }

    private static boolean sameEmail(String stored, String candidate) {
        return stored != null
                && candidate != null
                && stored.strip()
                        .toLowerCase(Locale.ROOT)
                        .equals(candidate.strip().toLowerCase(Locale.ROOT));
    }
}
