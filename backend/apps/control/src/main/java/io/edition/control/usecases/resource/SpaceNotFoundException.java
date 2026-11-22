package io.edition.control.usecases.resource;

import io.edition.control.usecases.flow.FlowException;
import io.edition.control.usecases.flow.ProblemCode;

/** Space 不存在或不属于路径上的租户（404 space_not_found）。 */
public final class SpaceNotFoundException extends FlowException {
    public SpaceNotFoundException() {
        super(ProblemCode.SPACE_NOT_FOUND);
    }
}
