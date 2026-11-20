package io.space.cli.shared;

/** 可向调用者报告的失败：稳定错误码、退出码和下一步提示，不携带秘密或远端异常原文。 */
public final class CliFailure extends RuntimeException {
    public final String code;
    public final int exit;
    public final String hint;
    public int httpStatus;
    public String traceId;
    public String retryAfter;
    public java.util.List<Violation> violations = java.util.List.of();
    public boolean violationsTruncated;

    public record Violation(String field, String code) {}

    public CliFailure(String code, String message, int exit, String hint) {
        super(message);
        this.code = code;
        this.exit = exit;
        this.hint = hint;
    }

    public static CliFailure input(String message, String hint) {
        return new CliFailure("invalid_input", message, 3, hint);
    }

    public static CliFailure error(String code, String message, String hint) {
        return new CliFailure(code, message, 1, hint);
    }

    public static CliFailure refused(String code, String message, String hint) {
        return new CliFailure(code, message, 3, hint);
    }

    public static CliFailure credential(String code, String message, String hint) {
        return new CliFailure(code, message, 2, hint);
    }
}
