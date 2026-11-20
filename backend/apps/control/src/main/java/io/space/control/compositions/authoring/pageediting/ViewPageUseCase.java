package io.space.control.compositions.authoring.pageediting;

import static io.space.control.compositions.authoring.pageediting.PageEditingTypes.*;

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
        try (var requestScope = io.space.control.compositions.RequestAuditContext.entry()) {
            return projection.view(credential, tenant, space, page);
        }
    }
}
