package io.edition.control.compositions.platform.operations;

import static io.edition.control.compositions.platform.operations.OperationsTypes.*;

import io.edition.concepts.audit.api.AuditApi;
import io.edition.concepts.user.api.UserApi;
import io.edition.control.compositions.*;
import io.edition.control.compositions.access.PlatformOperatorGuard;
import io.edition.control.compositions.access.TenantAccess;
import io.edition.control.compositions.flow.InvalidCursorException;
import java.time.*;
import java.util.*;
import org.springframework.transaction.annotation.Transactional;

@org.springframework.stereotype.Service
public class ListAuditUseCase {

    private final AuditApi audit;

    private final TenantAccess tenants;

    private final PlatformOperatorGuard operators;

    private final UserApi users;

    ListAuditUseCase(OperationsDependencies dependencies) {
        this.audit = dependencies.audit;
        this.tenants = dependencies.tenants;
        this.operators = dependencies.operators;
        this.users = dependencies.users;
    }

    @Transactional(readOnly = true)
    public AuditPage listAudit(String credential, UUID tenant, AuditFilter filter, int limit) {
        if (limit < 1 || limit > 100) throw new InvalidCursorException();
        if (filter.from() != null && filter.to() != null && !filter.from().isBefore(filter.to()))
            throw new InvalidCursorException();
        if (tenant == null) operators.require(credential);
        else tenants.requireUser(credential, tenant, List.of(TenantAccess.tenant(tenant)), TenantAccess.ADMIN);
        java.util.function.Supplier<AuditPage> query = () -> {
            var f = new AuditApi.Filter(
                    filter.actor(),
                    filter.action(),
                    filter.target(),
                    filter.outcome(),
                    filter.from(),
                    filter.to(),
                    filter.cursor(),
                    tenant == null);
            var rows = audit.query(f, limit + 1);
            var selected = rows.size() > limit ? rows.subList(0, limit) : rows;
            var items = selected.stream()
                    .map(e -> {
                        String name =
                                switch (e.actorType()) {
                                    case "user" ->
                                        e.actorId() == null
                                                ? "未知用户"
                                                : users.accountProfile(new UserApi.UserId(e.actorId()))
                                                        .map(UserApi.AccountProfile::name)
                                                        .orElse("已注销用户");
                                    case "token" -> "API 令牌";
                                    case "anonymous" -> "匿名访客";
                                    default -> "系统";
                                };
                        return new AuditItem(
                                e.id(),
                                e.eventId(),
                                e.rootId(),
                                e.time(),
                                e.kind(),
                                e.actorType(),
                                e.actorId(),
                                name,
                                e.action(),
                                e.targetType(),
                                e.targetId(),
                                e.outcome(),
                                e.ip(),
                                e.requestId(),
                                e.credentialId());
                    })
                    .toList();
            return new AuditPage(items, rows.size() > limit ? selected.getLast().id() : null, audit.count(f));
        };
        return tenant == null ? query.get() : tenants.inTenant(tenant, query);
    }
}
