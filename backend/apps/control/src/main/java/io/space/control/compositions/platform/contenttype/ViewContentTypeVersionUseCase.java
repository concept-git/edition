package io.space.control.compositions.platform.contenttype;

import static io.space.control.compositions.platform.contenttype.ContentTypeTypes.*;

import java.util.*;
import org.springframework.transaction.annotation.Transactional;

@Transactional
@org.springframework.stereotype.Service
public class ViewContentTypeVersionUseCase {
    private final ContentTypeOperations operations;

    ViewContentTypeVersionUseCase(ContentTypeDependencies dependencies) {
        this.operations = dependencies.operations;
    }

    public Version viewContentTypeVersion(String credential, UUID tenant, String reference) {
        return operations.viewContentTypeVersion(credential, tenant, reference);
    }
}
