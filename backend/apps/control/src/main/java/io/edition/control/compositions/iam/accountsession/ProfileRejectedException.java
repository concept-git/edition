package io.edition.control.compositions.iam.accountsession;

import io.edition.control.compositions.flow.FlowException;
import io.edition.control.compositions.flow.ProblemCode;
import io.edition.shared.ValidationViolation;
import java.util.List;

/** User.updateProfile : (rejected) → 422 profile_invalid，违反项原样透传。 */
public final class ProfileRejectedException extends FlowException {

    public ProfileRejectedException(List<ValidationViolation> violations) {
        super(ProblemCode.PROFILE_INVALID, violations);
    }
}
