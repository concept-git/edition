package io.edition.control.usecases.iam.apitoken;

import static io.edition.control.usecases.iam.apitoken.ApiTokenTypes.*;

import io.edition.control.modules.apitoken.api.ApiTokenApi;
import io.edition.control.usecases.access.TenantAccess;
import io.edition.control.usecases.flow.InvalidCursorException;
import java.time.Clock;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import org.springframework.transaction.annotation.Transactional;

@org.springframework.stereotype.Service
public class ListTokensUseCase {
    private final ApiTokenApi tokens;

    private final TenantAccess tenants;

    private final TokenRoleCeiling roles;

    private final Clock clock;

    ListTokensUseCase(ApiTokenDependencies dependencies) {
        this.tokens = dependencies.tokens;
        this.tenants = dependencies.tenants;
        this.roles = dependencies.roles;
        this.clock = dependencies.clock;
    }

    @Transactional(readOnly = true)
    public TokenPage listTokens(String credential, UUID tenant, String cursor, int requestedLimit) {
        var actor = tenants.admitUser(credential, tenant);
        UUID actorId = actor.principal().id();
        int limit = Math.max(1, Math.min(requestedLimit, 100));
        var visible = new ArrayList<ApiTokenApi.Metadata>();
        visible.addAll(tenants.inTenant(tenant, () -> tokens.ownedBy(actorId, tenant, false)));
        for (UUID space : roles.administeredSpaces(tenant, actor)) {
            visible.addAll(tenants.inTenant(tenant, () -> tokens.inSpace(tenant, space, false)));
        }
        List<ApiTokenApi.Metadata> distinct = TokenList.distinctSorted(visible);
        int offset = TokenList.offset(cursor);
        if (offset < 0 || offset > distinct.size()) {
            throw new InvalidCursorException();
        }
        int end = Math.min(offset + limit, distinct.size());
        List<TokenView> page = distinct.subList(offset, end).stream()
                .map(token -> TokenView.from(token, roles.role(token), clock.instant()))
                .toList();
        return new TokenPage(page, end < distinct.size() ? TokenList.cursor(end) : null, distinct.size());
    }
}
