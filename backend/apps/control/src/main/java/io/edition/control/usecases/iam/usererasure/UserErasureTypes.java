package io.edition.control.usecases.iam.usererasure;

import static io.edition.control.usecases.iam.usererasure.UserErasureTypes.*;

import io.edition.control.usecases.flow.FlowException;
import io.edition.control.usecases.flow.ProblemCode;
import io.edition.shared.ValidationViolation;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

/** Public composition inputs, results, and finite refusal types. */
public final class UserErasureTypes {
    private UserErasureTypes() {}

    public record UserSummary(
            UUID id, String email, String name, String status, boolean platformOperator, Instant updatedAt) {}

    public record UserPage(List<UserSummary> users, String nextCursor) {
        public UserPage {
            users = List.copyOf(users);
        }
    }

    public record RelatedGroup(String type, UUID id, UUID tenantId, String name) {}

    public record MembershipSummary(String type, UUID id, UUID tenantId, String name, String role, boolean soleOwner) {}

    public record UserDetail(
            UUID id,
            String email,
            String name,
            String avatar,
            String locale,
            boolean verified,
            String status,
            boolean platformOperator,
            List<MembershipSummary> memberships) {
        public UserDetail {
            memberships = List.copyOf(memberships);
        }
    }

    public static final class EraseConfirmationInvalidException extends FlowException {
        public EraseConfirmationInvalidException() {
            super(ProblemCode.ERASE_CONFIRMATION_INVALID);
        }
    }

    public static final class UserNotFoundException extends FlowException {
        public UserNotFoundException() {
            super(ProblemCode.USER_NOT_FOUND);
        }
    }

    public static final class UserErasedException extends FlowException {
        public UserErasedException() {
            super(ProblemCode.USER_ERASED);
        }
    }

    public static final class UserMustBeDeactivatedException extends FlowException {
        public UserMustBeDeactivatedException() {
            super(ProblemCode.USER_MUST_BE_DEACTIVATED);
        }
    }

    public static final class UserSearchQueryInvalidException extends FlowException {
        public UserSearchQueryInvalidException() {
            super(ProblemCode.VALIDATION_FAILED, List.of(new ValidationViolation("q", "size_out_of_range")));
        }
    }

    public static final class OwnershipTransferRequiredException extends FlowException {
        private final List<RelatedGroup> groups;

        public OwnershipTransferRequiredException(List<RelatedGroup> groups) {
            super(ProblemCode.OWNERSHIP_TRANSFER_REQUIRED);
            this.groups = List.copyOf(groups);
        }

        public List<RelatedGroup> groups() {
            return groups;
        }
    }
}
