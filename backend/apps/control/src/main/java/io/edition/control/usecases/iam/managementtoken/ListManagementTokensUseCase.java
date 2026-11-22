package io.edition.control.usecases.iam.managementtoken;

import static io.edition.control.usecases.iam.managementtoken.ManagementTokenTypes.*;

import io.edition.control.modules.managementtoken.api.ManagementTokenApi;
import io.edition.control.usecases.flow.InvalidCursorException;
import io.edition.control.usecases.principal.PrincipalResolution;
import java.time.Clock;
import java.util.UUID;
import org.springframework.transaction.annotation.Transactional;

@org.springframework.stereotype.Service
public class ListManagementTokensUseCase {
    private final ManagementTokenApi tokens;
    private final PrincipalResolution principals;

    private final Clock clock;

    ListManagementTokensUseCase(ManagementTokenDependencies dependencies) {
        this.tokens = dependencies.tokens;
        this.principals = dependencies.principals;
        this.clock = dependencies.clock;
    }

    @Transactional(readOnly = true)
    public ManagementTokenPage listManagementTokens(String credential, String cursor, int limit) {
        UUID owner = principals.requireSessionUser(credential);
        ManagementTokenApi.Page page;
        try {
            page = tokens.ownedBy(owner, cursor, limit);
        } catch (IllegalArgumentException invalid) {
            throw new InvalidCursorException();
        }
        return new ManagementTokenPage(
                page.items().stream()
                        .map(t -> ManagementTokenView.from(t, clock.instant()))
                        .toList(),
                page.nextCursor());
    }
}
