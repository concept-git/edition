package io.edition.control.compositions.resource;

import io.edition.control.compositions.flow.FlowException;
import io.edition.control.compositions.flow.ProblemCode;

/** Collection 不存在或不属于路径上的租户（404 collection_not_found）。 */
public final class CollectionNotFoundException extends FlowException {
    public CollectionNotFoundException() {
        super(ProblemCode.COLLECTION_NOT_FOUND);
    }
}
