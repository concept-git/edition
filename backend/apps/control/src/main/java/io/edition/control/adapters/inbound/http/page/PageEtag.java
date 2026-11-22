package io.edition.control.adapters.inbound.http.page;

import io.edition.control.adapters.inbound.http.problem.GatewayProblemException;
import io.edition.control.usecases.flow.ProblemCode;
import io.edition.shared.Sha256;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * 内容子资源使用 {@code "rev-N"}；完整详情使用 {@code "page-rev-N-SHA256"} 表示标签。
 * 写端接受详情标签仅作旧客户端的内容基线兼容桥；新客户端必须使用内容快照标签。
 */
public final class PageEtag {
    private static final Pattern STRONG = Pattern.compile("\"(?:rev-(\\d+)|page-rev-(\\d+)-[a-f0-9]{64})\"");

    private PageEtag() {}

    public static String of(int revision) {
        return "\"rev-" + revision + "\"";
    }

    /** 完整详情标签；兼容客户端可提取内容基线，新客户端必须读 /content。 */
    public static String representation(int revision, String serialized) {
        return "\"page-rev-" + revision + "-" + Sha256.hex(serialized) + "\"";
    }

    /** 解析 If-Match；缺失 428 precondition_required，非法 400 invalid_precondition。 */
    static int revision(String ifMatch) {
        if (ifMatch == null) throw new PreconditionRequiredException();
        Matcher match = STRONG.matcher(ifMatch.strip());
        if (!match.matches()) throw new InvalidPreconditionException();
        try {
            return Integer.parseInt(match.group(1) == null ? match.group(2) : match.group(1));
        } catch (NumberFormatException invalid) {
            throw new InvalidPreconditionException();
        }
    }

    public static final class PreconditionRequiredException extends GatewayProblemException {
        PreconditionRequiredException() {
            super(ProblemCode.PRECONDITION_REQUIRED);
        }
    }

    public static final class InvalidPreconditionException extends GatewayProblemException {
        InvalidPreconditionException() {
            super(ProblemCode.INVALID_PRECONDITION);
        }
    }
}
