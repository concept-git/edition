package io.space.control.compositions.iam.accountsession;

import io.space.control.compositions.flow.FlowException;
import io.space.control.compositions.flow.ProblemCode;
import io.space.shared.ValidationViolation;
import java.util.List;

/** User.updateProfile : (rejected) → 422 profile_invalid，违反项原样透传。 */
public final class ProfileRejectedException extends FlowException {

    public ProfileRejectedException(List<ValidationViolation> violations) {
        super(ProblemCode.PROFILE_INVALID, violations);
    }
}
