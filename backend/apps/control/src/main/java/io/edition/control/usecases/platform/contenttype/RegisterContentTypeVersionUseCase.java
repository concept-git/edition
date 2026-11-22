package io.edition.control.usecases.platform.contenttype;

import static io.edition.control.usecases.platform.contenttype.ContentTypeTypes.*;

import io.edition.content.ContentTypeDefinition;
import io.edition.control.usecases.flow.FlowResponse;
import java.util.*;
import org.springframework.transaction.annotation.Transactional;

@Transactional
@org.springframework.stereotype.Service
public class RegisterContentTypeVersionUseCase {
    private final ContentTypeOperations operations;

    RegisterContentTypeVersionUseCase(ContentTypeDependencies dependencies) {
        this.operations = dependencies.operations;
    }

    public FlowResponse<Version> registerContentTypeVersion(
            String credential, UUID tenant, String type, int base, ContentTypeDefinition definition, String key) {
        return operations.registerContentTypeVersion(credential, tenant, type, base, definition, key);
    }
}
