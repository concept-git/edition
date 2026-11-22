package io.edition.control.usecases.resource;

import io.edition.control.usecases.flow.FlowException;
import io.edition.control.usecases.flow.ProblemCode;

/** 归档空间及其后代拒绝非恢复类 mutation（409 space_archived）。 */
public final class SpaceArchivedException extends FlowException {

    public SpaceArchivedException() {
        super(ProblemCode.SPACE_ARCHIVED);
    }
}
