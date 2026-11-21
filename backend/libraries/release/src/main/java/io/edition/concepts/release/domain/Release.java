package io.edition.concepts.release.domain;

import io.edition.concepts.release.api.*;
import io.edition.concepts.release.api.ReleaseApi;
import java.time.Instant;
import java.util.Objects;
import java.util.UUID;

/** Release 行状态机。快照内容不进本对象。 */
public final class Release {
    private final UUID id;
    private final UUID scopeId;
    private ReleaseApi.Status status;
    private String label;
    private String notes;
    private final ReleaseApi.Source source;
    private int pageCount;
    private ReleaseApi.Report report;
    private final Instant createdAt;
    private Instant promotedAt;
    private boolean loaded;

    public Release(
            UUID id,
            UUID scopeId,
            ReleaseApi.Status status,
            String label,
            String notes,
            ReleaseApi.Source source,
            int pageCount,
            ReleaseApi.Report report,
            Instant createdAt,
            Instant promotedAt,
            boolean loaded) {
        this.id = Objects.requireNonNull(id, "id");
        this.scopeId = Objects.requireNonNull(scopeId, "scope");
        this.status = Objects.requireNonNull(status, "status");
        this.label = Objects.requireNonNull(label, "label");
        this.notes = notes;
        this.source = Objects.requireNonNull(source, "source");
        this.pageCount = pageCount;
        this.report = report == null ? ReleaseApi.Report.empty() : report;
        this.createdAt = Objects.requireNonNull(createdAt, "created at");
        this.promotedAt = promotedAt;
        this.loaded = loaded;
    }

    public void requireLoadable() {
        if (status != ReleaseApi.Status.DRAFT) {
            throw new IllegalStateException("load requires draft");
        }
        if (loaded) throw new IllegalStateException("load at most once");
    }

    public void markLoaded(int pages) {
        requireLoadable();
        this.loaded = true;
        this.pageCount = pages;
    }

    public void requireValidatable() {
        if (status != ReleaseApi.Status.DRAFT) {
            throw new IllegalStateException("validate requires draft");
        }
        if (!loaded) throw new IllegalStateException("validate requires load");
    }

    public void recordLoadReport(ReleaseApi.Report next) {
        if (status != ReleaseApi.Status.DRAFT) {
            throw new IllegalStateException("load requires draft");
        }
        this.report = next;
    }

    public void recordErrors(ReleaseApi.Report next) {
        requireValidatable();
        this.report = next;
    }

    public void markValidated(ReleaseApi.Report next) {
        requireValidatable();
        this.status = ReleaseApi.Status.VALIDATED;
        this.report = next;
    }

    public void markFlagged(ReleaseApi.Report next) {
        requireValidatable();
        this.status = ReleaseApi.Status.FLAGGED;
        this.report = next;
    }

    public void approve() {
        if (status != ReleaseApi.Status.FLAGGED) {
            throw new IllegalStateException("approve requires flagged");
        }
        this.status = ReleaseApi.Status.VALIDATED;
    }

    public void requirePromotable() {
        if (status != ReleaseApi.Status.VALIDATED && status != ReleaseApi.Status.ARCHIVED) {
            throw new IllegalStateException("promote requires validated or archived");
        }
    }

    public void markLive(Instant at) {
        requirePromotable();
        this.status = ReleaseApi.Status.LIVE;
        this.promotedAt = Objects.requireNonNull(at, "promoted at");
    }

    public void markArchived() {
        if (status != ReleaseApi.Status.LIVE) {
            throw new IllegalStateException("only live archives on promote");
        }
        this.status = ReleaseApi.Status.ARCHIVED;
    }

    public void requireDiscardable() {
        if (status != ReleaseApi.Status.DRAFT
                && status != ReleaseApi.Status.FLAGGED
                && status != ReleaseApi.Status.VALIDATED) {
            throw new IllegalStateException("discard requires draft, flagged or validated");
        }
    }

    public void relabel(String next) {
        this.label = normalizeLabel(next);
    }

    public void annotate(String next) {
        this.notes = next == null || next.isBlank() ? null : next.strip();
    }

    public ReleaseApi.View view() {
        return new ReleaseApi.View(id, scopeId, status, label, notes, source, pageCount, report, createdAt, promotedAt);
    }

    public UUID id() {
        return id;
    }

    public UUID scopeId() {
        return scopeId;
    }

    public ReleaseApi.Status status() {
        return status;
    }

    public String label() {
        return label;
    }

    public String notes() {
        return notes;
    }

    public ReleaseApi.Source source() {
        return source;
    }

    public int pageCount() {
        return pageCount;
    }

    public ReleaseApi.Report report() {
        return report;
    }

    public Instant createdAt() {
        return createdAt;
    }

    public Instant promotedAt() {
        return promotedAt;
    }

    public boolean loaded() {
        return loaded;
    }

    public static String normalizeLabel(String value) {
        if (value == null) throw new IllegalArgumentException("label required");
        String stripped = value.strip();
        int length = stripped.codePointCount(0, stripped.length());
        if (length < 1 || length > ReleaseApi.MAX_LABEL_CODE_POINTS) {
            throw new IllegalArgumentException("label must contain 1 to 32 characters");
        }
        if (stripped.chars().anyMatch(code -> Character.isISOControl(code))) {
            throw new IllegalArgumentException("label must not contain control characters");
        }
        return stripped;
    }
}
