package io.edition.control.usecases.authoring.permission;

import io.edition.control.modules.permission.api.PermissionApi;
import io.edition.control.usecases.flow.FlowException;
import io.edition.control.usecases.flow.ProblemCode;

/** 乐观 restriction 快照已过期；gateway 用 current revision 生成最新强 ETag。 */
public final class PermissionVersionConflictException extends FlowException {
    private final long currentRevision;

    PermissionVersionConflictException(PermissionApi.RestrictionView current) {
        super(ProblemCode.PERMISSION_VERSION_CONFLICT);
        this.currentRevision = current.revision();
    }

    public long currentRevision() {
        return currentRevision;
    }
}
