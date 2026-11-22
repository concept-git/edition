package io.edition.control.usecases.authoring.pageediting;

import static io.edition.control.usecases.authoring.pageediting.PageEditingTypes.*;

import java.util.UUID;
import org.springframework.transaction.annotation.Transactional;

@org.springframework.stereotype.Service
public class ViewPageUseCase {

    private final PageProjection projection;

    ViewPageUseCase(PageEditingDependencies dependencies) {
        this.projection = dependencies.projection;
    }

    @Transactional(readOnly = true)
    public PageDetail viewPage(String credential, UUID tenant, UUID space, UUID page) {
        try (var requestScope = io.edition.control.usecases.RequestAuditContext.entry()) {
            return projection.view(credential, tenant, space, page);
        }
    }
}
