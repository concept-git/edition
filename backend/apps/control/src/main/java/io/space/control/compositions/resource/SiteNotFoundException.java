package io.space.control.compositions.resource;

import io.space.control.compositions.flow.FlowException;
import io.space.control.compositions.flow.ProblemCode;

/** 站点不存在或不属于路径上的租户（404 site_not_found）。 */
public final class SiteNotFoundException extends FlowException {
    public SiteNotFoundException() {
        super(ProblemCode.SITE_NOT_FOUND);
    }
}
