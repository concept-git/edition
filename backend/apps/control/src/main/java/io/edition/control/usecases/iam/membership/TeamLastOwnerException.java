package io.edition.control.usecases.iam.membership;

import io.edition.control.usecases.flow.FlowException;
import io.edition.control.usecases.flow.ProblemCode;
import java.util.List;
import java.util.UUID;

/** 移出租户成员会让这些 Team 失去最后一位 owner，须先转移所有权（409 team_last_owner + relatedIds）。 */
public final class TeamLastOwnerException extends FlowException {
    private final List<UUID> teams;

    public TeamLastOwnerException(List<UUID> teams) {
        super(ProblemCode.TEAM_LAST_OWNER);
        this.teams = List.copyOf(teams);
    }

    public List<UUID> teams() {
        return teams;
    }
}
