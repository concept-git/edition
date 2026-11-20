package io.space.control.compositions.hosting.customdomain;

import io.space.control.compositions.flow.FlowException;
import io.space.control.compositions.flow.ProblemCode;
import io.space.shared.ValidationViolation;
import java.util.List;

/** 本 flow 专属 error case，与 {@code DomainResults} / {@code DomainProof} 共置。 */
final class DomainDnsTimeoutException extends FlowException {
    DomainDnsTimeoutException() {
        super(ProblemCode.DEPENDENCY_TIMEOUT);
    }
}

final class DomainDnsUnavailableException extends FlowException {
    DomainDnsUnavailableException() {
        super(ProblemCode.DEPENDENCY_UNAVAILABLE);
    }
}

final class DomainHostInvalidException extends FlowException {
    DomainHostInvalidException() {
        super(ProblemCode.VALIDATION_FAILED, List.of(new ValidationViolation("host", "invalid")));
    }
}

final class DomainIsPrimaryException extends FlowException {
    DomainIsPrimaryException() {
        super(ProblemCode.DOMAIN_IS_PRIMARY);
    }
}

final class DomainNotFoundException extends FlowException {
    DomainNotFoundException() {
        super(ProblemCode.DOMAIN_NOT_FOUND);
    }
}

final class DomainNotProvenException extends FlowException {
    DomainNotProvenException() {
        super(ProblemCode.NOT_PROVEN);
    }
}

final class DomainNotVerifiedException extends FlowException {
    DomainNotVerifiedException() {
        super(ProblemCode.DOMAIN_NOT_VERIFIED);
    }
}

final class DomainTakenException extends FlowException {
    DomainTakenException() {
        super(ProblemCode.DOMAIN_TAKEN);
    }
}
