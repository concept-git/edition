package io.edition.control.usecases.authoring.pageediting;

import static io.edition.control.usecases.authoring.pageediting.PageEditingTypes.*;

import io.edition.control.usecases.access.TenantAccess;
import java.util.UUID;
import org.springframework.transaction.annotation.Transactional;

@org.springframework.stereotype.Service
public class ViewPageContentUseCase {

    private final PageAccess access;

    ViewPageContentUseCase(PageEditingDependencies dependencies) {
        this.access = dependencies.access;
    }

    @Transactional(readOnly = true)
    public ContentSnapshot viewPageContent(String credential, UUID tenant, UUID space, UUID page) {
        try (var requestScope = io.edition.control.usecases.RequestAuditContext.entry()) {
            var located = access.workingPage(tenant, space, page);
            access.require(credential, tenant, space, page, TenantAccess.READ);
            return ContentSnapshot.of(located.page());
        }
    }
}
