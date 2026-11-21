package io.edition.control.compositions.resource;

import io.edition.control.compositions.flow.FlowException;
import io.edition.control.compositions.flow.ProblemCode;

/** 归档空间及其后代拒绝非恢复类 mutation（409 space_archived）。 */
public final class SpaceArchivedException extends FlowException {

    public SpaceArchivedException() {
        super(ProblemCode.SPACE_ARCHIVED);
    }
}
