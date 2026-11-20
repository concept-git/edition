package io.space.contentapp.compositions.shared;

public final class ContentProblem extends RuntimeException {
    public final int status;
    public final String code;

    public ContentProblem(int status, String code) {
        super(code);
        this.status = status;
        this.code = code;
    }

    public static ContentProblem unavailable() {
        return new ContentProblem(503, "delivery_unavailable");
    }

    public static ContentProblem publication(String outcome) {
        return switch (outcome) {
            case "site_not_found", "space_not_found", "page_not_found", "machine_index_not_found" ->
                new ContentProblem(404, outcome);
            case "invalid_token", "reader_session_invalid", "reader_access_expired" -> new ContentProblem(401, outcome);
            case "validation_failed" -> new ContentProblem(422, outcome);
            case "snapshot_changed" -> new ContentProblem(409, outcome);
            case "forbidden" -> new ContentProblem(403, "read_forbidden");
            case "access_update_pending" -> new ContentProblem(503, outcome);
            default -> unavailable();
        };
    }
}
