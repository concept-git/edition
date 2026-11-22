package io.edition.control.adapters.inbound.http.permission;

import io.edition.control.adapters.inbound.http.problem.GatewayProblemException;
import io.edition.control.usecases.flow.ProblemCode;
import java.util.regex.Pattern;

/** Restriction revision 的唯一强 ETag 形态；客户端只需原样回传。 */
public final class PermissionEtag {
    private static final Pattern STRONG = Pattern.compile("\"permission-(\\d+)\"");

    private PermissionEtag() {}

    public static String of(long revision) {
        return "\"permission-" + revision + "\"";
    }

    static long revision(String ifMatch) {
        if (ifMatch == null) {
            throw new PreconditionRequiredException();
        }
        var match = STRONG.matcher(ifMatch.strip());
        if (!match.matches()) {
            throw new InvalidPreconditionException();
        }
        try {
            return Long.parseLong(match.group(1));
        } catch (NumberFormatException invalid) {
            throw new InvalidPreconditionException();
        }
    }

    static final class PreconditionRequiredException extends GatewayProblemException {
        PreconditionRequiredException() {
            super(ProblemCode.PRECONDITION_REQUIRED);
        }
    }

    static final class InvalidPreconditionException extends GatewayProblemException {
        InvalidPreconditionException() {
            super(ProblemCode.INVALID_PRECONDITION);
        }
    }
}
