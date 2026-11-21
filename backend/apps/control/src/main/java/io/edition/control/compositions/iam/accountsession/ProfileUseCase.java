package io.edition.control.compositions.iam.accountsession;

import static io.edition.control.compositions.iam.accountsession.AccountSessionTypes.*;

import io.edition.concepts.user.api.UserApi;
import java.util.UUID;

@org.springframework.stereotype.Service
public class ProfileUseCase {
    private final AccountTenants accountTenants;
    private final UserApi users;

    ProfileUseCase(AccountSessionDependencies dependencies) {
        this.accountTenants = dependencies.accountTenants;
        this.users = dependencies.users;
    }

    public Profile profile(UUID principal) {
        try (var requestScope = io.edition.control.compositions.RequestAuditContext.entry()) {
            var user = new UserApi.UserId(principal);
            return Profile.from(
                    users.accountProfile(user).orElseThrow(),
                    users.isPlatformOperator(user),
                    accountTenants.tenantsOf(principal));
        }
    }
}
