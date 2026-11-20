package io.space.control.compositions.resource;

import io.space.control.compositions.flow.FlowException;
import io.space.control.compositions.flow.ProblemCode;

/** Space 不存在或不属于路径上的租户（404 space_not_found）。 */
public final class SpaceNotFoundException extends FlowException {
    public SpaceNotFoundException() {
        super(ProblemCode.SPACE_NOT_FOUND);
    }
}
