package io.edition.control.usecases.resource;

import io.edition.control.usecases.flow.FlowException;
import io.edition.control.usecases.flow.ProblemCode;

/** Page 不存在，或不挂在路径上的 Space / 租户之下（404 page_not_found）。 */
public final class PageNotFoundException extends FlowException {
    public PageNotFoundException() {
        super(ProblemCode.PAGE_NOT_FOUND);
    }
}
