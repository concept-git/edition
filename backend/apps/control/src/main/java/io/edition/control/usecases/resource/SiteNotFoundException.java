package io.edition.control.usecases.resource;

import io.edition.control.usecases.flow.FlowException;
import io.edition.control.usecases.flow.ProblemCode;

/** 站点不存在或不属于路径上的租户（404 site_not_found）。 */
public final class SiteNotFoundException extends FlowException {
    public SiteNotFoundException() {
        super(ProblemCode.SITE_NOT_FOUND);
    }
}
