package io.edition.control.usecases.platform.contenttype;

import static io.edition.control.usecases.platform.contenttype.ContentTypeTypes.*;

import io.edition.control.usecases.flow.FlowResponse;
import java.util.*;
import org.springframework.transaction.annotation.Transactional;

@Transactional
@org.springframework.stereotype.Service
public class ActivateContentTypeUseCase {
    private final ContentTypeOperations operations;

    ActivateContentTypeUseCase(ContentTypeDependencies dependencies) {
        this.operations = dependencies.operations;
    }

    public FlowResponse<State> activateContentType(
            String credential, UUID tenant, String type, int base, String reference, String key) {
        return operations.activateContentType(credential, tenant, type, base, reference, key);
    }
}
