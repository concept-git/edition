package io.space.delivery.contract;

import java.time.Instant;
import java.util.UUID;

/** Bounded telemetry with hashed network identity and filtering of obvious sensitive queries. */
public record TelemetryEvent(
        UUID id,
        UUID sourceId,
        Instant time,
        UUID tenantId,
        UUID siteId,
        UUID pageId,
        String type,
        String path,
        String query,
        UUID searchId,
        String visitor,
        String referrer,
        boolean zero,
        boolean observable,
        long dropped) {
    public TelemetryEvent {
        query = sanitizeQuery(query);
        if (path != null) {
            path = path.split("[?#]", 2)[0];
            if (path.length() > 512) path = path.substring(0, 512);
        }
        if (visitor != null && !visitor.matches("[a-f0-9]{32}")) visitor = null;
        if (referrer != null && !referrer.matches("[A-Za-z0-9.-]{1,253}")) referrer = null;
    }

    public static String sanitizeQuery(String q) {
        if (q == null) return null;
        String v = q.substring(0, q.offsetByCodePoints(0, Math.min(200, q.codePointCount(0, q.length()))));
        v = java.text.Normalizer.normalize(v, java.text.Normalizer.Form.NFKC)
                .strip()
                .toLowerCase(java.util.Locale.ROOT)
                .replaceAll("\\s+", " ");
        v = v.substring(0, v.offsetByCodePoints(0, Math.min(200, v.codePointCount(0, v.length()))));
        if (v.matches(
                "(?is).*(?:[\\w.+-]+@[\\w.-]+\\.[a-z]{2,}|(?:password|secret|token|authorization)\\s*[:=]|(?<![0-9])1[3-9][0-9]{9}(?![0-9])|[A-Za-z0-9_=-]{40,}).*"))
            return null;
        return v;
    }
}
