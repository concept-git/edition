package io.edition.control.compositions.platform.mailadmin;

import io.edition.concepts.mailoutbox.api.MailDeliveryApi;
import io.edition.control.compositions.access.PlatformOperatorGuard;
import io.edition.control.compositions.access.TenantAccess;
import io.edition.control.compositions.flow.InvalidCursorException;
import io.edition.control.compositions.flow.OperationNotFoundException;
import io.edition.control.compositions.principal.PrincipalResolution;
import io.edition.control.compositions.principal.PrincipalResolver.Resolution;
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Component;

@Component
final class MailAdminAccess {
    private final PlatformOperatorGuard operators;
    private final TenantAccess tenants;
    private final PrincipalResolution principals;
    private final MailDeliveryApi delivery;

    MailAdminAccess(
            PlatformOperatorGuard operators,
            TenantAccess tenants,
            PrincipalResolution principals,
            MailDeliveryApi delivery) {
        this.operators = operators;
        this.tenants = tenants;
        this.principals = principals;
        this.delivery = delivery;
    }

    Resolution require(String credential, UUID tenant) {
        if (tenant != null)
            return tenants.require(credential, tenant, List.of(TenantAccess.tenant(tenant)), TenantAccess.ADMIN);
        var resolution = principals.require(credential);
        operators.require(resolution);
        return resolution;
    }

    MailDeliveryApi.View message(UUID tenant, UUID messageId) {
        var found = delivery.view(messageId).orElseThrow(OperationNotFoundException::new);
        if (tenant != null && (!tenant.equals(found.tenantId()) || !found.kind().equals("invitation")))
            throw new OperationNotFoundException();
        return found;
    }

    io.edition.shared.KeysetCursor cursor(String value) {
        try {
            return io.edition.shared.KeysetCursor.decode(value).orElse(null);
        } catch (IllegalArgumentException invalid) {
            throw new InvalidCursorException();
        }
    }

    <T> T inScope(UUID tenant, java.util.function.Supplier<T> action) {
        return tenant == null ? action.get() : tenants.inTenant(tenant, action);
    }
}
