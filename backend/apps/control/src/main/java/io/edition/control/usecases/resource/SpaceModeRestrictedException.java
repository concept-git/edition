package io.edition.control.usecases.resource;

import io.edition.control.usecases.flow.FlowException;
import io.edition.control.usecases.flow.ProblemCode;

/** synced 空间拒绝页面/目录/标签 mutation（409 space_mode_restricted）；待票 20 开启。 */
public final class SpaceModeRestrictedException extends FlowException {

    public SpaceModeRestrictedException() {
        super(ProblemCode.SPACE_MODE_RESTRICTED);
    }
}
