package io.edition.control.usecases.iam.team;

import static io.edition.control.usecases.iam.team.TeamTypes.*;

import io.edition.control.modules.membership.api.MembershipApi;
import io.edition.control.usecases.flow.FlowException;
import io.edition.control.usecases.flow.ProblemCode;
import io.edition.shared.ValidationViolation;
import io.swagger.v3.oas.annotations.media.Schema;
import java.time.Instant;
import java.util.List;
import java.util.Locale;
import java.util.UUID;

/** Public composition inputs, results, and finite refusal types. */
public final class TeamTypes {
    private TeamTypes() {}

    public record TeamView(
            UUID id,
            UUID tenantId,
            String name,
            String callerRole,
            long memberCount,
            long ownerCount,
            Instant createdAt,
            Instant updatedAt) {}

    public record TeamPage(
            List<TeamView> items, @Schema(nullable = true) String nextCursor) {
        public TeamPage {
            items = List.copyOf(items);
        }
    }

    @Schema(name = "TeamMemberSummary")
    public record MemberView(UUID id, String name, String avatar, String email, String role, Instant joinedAt) {}

    @Schema(name = "TeamMemberPage")
    public record Members(
            List<MemberView> items, @Schema(nullable = true) String nextCursor) {
        public Members {
            items = List.copyOf(items);
        }
    }

    @Schema(name = "TeamInvitationSummary")
    public record InviteView(UUID id, String email, String role, Instant expiresAt, Instant createdAt) {
        static InviteView from(MembershipApi.InviteView invite) {
            return new InviteView(
                    invite.id().value(),
                    invite.email(),
                    invite.role().name().toLowerCase(Locale.ROOT),
                    invite.expiresAt(),
                    invite.createdAt());
        }
    }

    @Schema(name = "TeamInvitationPage")
    public record Invites(
            List<InviteView> items, @Schema(nullable = true) String nextCursor) {
        public Invites {
            items = List.copyOf(items);
        }
    }

    @Schema(name = "TeamIssuedInvitation")
    public record IssuedInvite(InviteView invite, String token) {}

    public static final class TeamNameInvalidException extends FlowException {
        public TeamNameInvalidException() {
            super(ProblemCode.TEAM_NAME_INVALID, List.of(new ValidationViolation("name", "size_out_of_range")));
        }
    }

    public static final class TeamNameTakenException extends FlowException {
        public TeamNameTakenException() {
            super(ProblemCode.TEAM_NAME_TAKEN);
        }
    }

    public static final class TeamNotFoundException extends FlowException {
        public TeamNotFoundException() {
            super(ProblemCode.TEAM_NOT_FOUND);
        }
    }
}
