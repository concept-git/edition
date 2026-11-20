package io.space.control.compositions.iam.managementtoken;

import static io.space.control.compositions.iam.managementtoken.ManagementTokenTypes.*;

import io.space.concepts.managementtoken.api.ManagementTokenApi;
import io.space.control.compositions.flow.InvalidCursorException;
import io.space.control.compositions.principal.PrincipalResolution;
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
