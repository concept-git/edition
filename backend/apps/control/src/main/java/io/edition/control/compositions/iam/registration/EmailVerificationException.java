package io.edition.control.compositions.iam.registration;

import io.edition.control.compositions.flow.FlowException;
import io.edition.control.compositions.flow.ProblemCode;

/** User.verify : (error) → 400 verify_token_invalid。 */
public final class EmailVerificationException extends FlowException {

    public EmailVerificationException() {
        super(ProblemCode.VERIFY_TOKEN_INVALID);
    }
}
