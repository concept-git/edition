package io.edition.control.usecases.authoring.collection;

import io.edition.control.modules.collection.api.CollectionApi;
import io.edition.control.usecases.flow.FlowException;
import io.edition.control.usecases.flow.ProblemCode;
import io.edition.shared.ValidationViolation;
import java.util.List;

final class CollectionPatch {
    private CollectionPatch() {}

    static CollectionApi.IconKey icon(String raw) {
        if (raw == null) return null;
        try {
            return CollectionApi.IconKey.parse(raw.strip());
        } catch (IllegalArgumentException | NullPointerException ignored) {
            throw new CollectionInvalidException("icon", "invalid_format");
        }
    }

    static final class CollectionInvalidException extends FlowException {
        CollectionInvalidException(String field, String code) {
            super(ProblemCode.VALIDATION_FAILED, List.of(new ValidationViolation(field, code)));
        }
    }
}
