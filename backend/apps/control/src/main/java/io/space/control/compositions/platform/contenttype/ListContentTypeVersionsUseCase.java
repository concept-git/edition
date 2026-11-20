package io.space.control.compositions.platform.contenttype;

import static io.space.control.compositions.platform.contenttype.ContentTypeTypes.*;

import java.util.*;
import org.springframework.transaction.annotation.Transactional;

@Transactional
@org.springframework.stereotype.Service
public class ListContentTypeVersionsUseCase {
    private final ContentTypeOperations operations;

    ListContentTypeVersionsUseCase(ContentTypeDependencies dependencies) {
        this.operations = dependencies.operations;
    }

    public VersionList listContentTypeVersions(String credential, UUID tenant, String type) {
        return operations.listContentTypeVersions(credential, tenant, type);
    }
}
