package io.space.control.compositions.resource;

import io.space.control.compositions.flow.FlowException;
import io.space.control.compositions.flow.ProblemCode;

/** synced 空间拒绝页面/目录/标签 mutation（409 space_mode_restricted）；待票 20 开启。 */
public final class SpaceModeRestrictedException extends FlowException {

    public SpaceModeRestrictedException() {
        super(ProblemCode.SPACE_MODE_RESTRICTED);
    }
}
