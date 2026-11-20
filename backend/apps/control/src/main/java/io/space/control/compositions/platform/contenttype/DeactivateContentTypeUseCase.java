package io.space.control.compositions.platform.contenttype;

import static io.space.control.compositions.platform.contenttype.ContentTypeTypes.*;

import io.space.control.compositions.flow.FlowResponse;
import java.util.*;
import org.springframework.transaction.annotation.Transactional;

@Transactional
@org.springframework.stereotype.Service
public class DeactivateContentTypeUseCase {
    private final ContentTypeOperations operations;

    DeactivateContentTypeUseCase(ContentTypeDependencies dependencies) {
        this.operations = dependencies.operations;
    }

    public FlowResponse<State> deactivateContentType(
            String credential, UUID tenant, String type, int base, String key) {
        return operations.deactivateContentType(credential, tenant, type, base, key);
    }
}
