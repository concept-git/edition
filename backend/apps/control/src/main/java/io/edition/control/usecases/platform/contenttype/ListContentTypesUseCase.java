package io.edition.control.usecases.platform.contenttype;

import static io.edition.control.usecases.platform.contenttype.ContentTypeTypes.*;

import java.util.*;
import org.springframework.transaction.annotation.Transactional;

@Transactional
@org.springframework.stereotype.Service
public class ListContentTypesUseCase {
    private final ContentTypeOperations operations;

    ListContentTypesUseCase(ContentTypeDependencies dependencies) {
        this.operations = dependencies.operations;
    }

    public TypeList listContentTypes(String credential, UUID tenant) {
        return operations.listContentTypes(credential, tenant);
    }
}
