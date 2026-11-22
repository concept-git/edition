package io.edition.control.usecases.hosting.site;

import io.edition.control.usecases.flow.FlowException;
import io.edition.control.usecases.flow.ProblemCode;

/** 仍有挂载时删除站点（409 site_not_empty）。 */
public final class SiteNotEmptyException extends FlowException {
    public SiteNotEmptyException() {
        super(ProblemCode.SITE_NOT_EMPTY);
    }
}
