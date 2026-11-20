package io.space.control.compositions.platform.contenttype;

import static io.space.control.compositions.platform.contenttype.ContentTypeTypes.*;

import java.util.*;

@org.springframework.stereotype.Component
final class ContentTypeDependencies {
    final ContentTypeOperations operations;

    public ContentTypeDependencies(ContentTypeOperations operations) {
        this.operations = operations;
    }
}
