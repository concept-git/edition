package io.edition.control.usecases.iam.registration;

import io.edition.control.usecases.flow.FlowException;
import io.edition.control.usecases.flow.ProblemCode;

/** sync registerTaken 的响应载体：User.register : (error) → 409 email_taken。 */
public final class EmailTakenException extends FlowException {

    public EmailTakenException(String email) {
        super(ProblemCode.EMAIL_TAKEN, "email already registered: " + email);
    }
}
