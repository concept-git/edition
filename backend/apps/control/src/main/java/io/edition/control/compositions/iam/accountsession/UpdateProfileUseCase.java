package io.edition.control.compositions.iam.accountsession;

import static io.edition.control.compositions.iam.accountsession.AccountSessionTypes.*;

import io.edition.concepts.user.api.UserApi;
import java.util.UUID;

@org.springframework.stereotype.Service
public class UpdateProfileUseCase {
    private final AccountTenants accountTenants;
    private final UserApi users;

    UpdateProfileUseCase(AccountSessionDependencies dependencies) {
        this.accountTenants = dependencies.accountTenants;
        this.users = dependencies.users;
    }

    public Profile updateProfile(UUID principal, String name, String locale, String avatar) {
        try (var requestScope = io.edition.control.compositions.RequestAuditContext.entry()) {
            var user = new UserApi.UserId(principal);
            return switch (users.updateProfile(user, name, locale, avatar)) {
                case UserApi.UpdateProfileResult.Updated updated ->
                    Profile.from(
                            updated.profile(), users.isPlatformOperator(user), accountTenants.tenantsOf(principal));
                case UserApi.UpdateProfileResult.Rejected rejected ->
                    throw new ProfileRejectedException(rejected.violations());
            };
        }
    }
}
