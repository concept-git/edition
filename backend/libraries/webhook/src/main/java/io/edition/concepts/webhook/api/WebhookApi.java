package io.edition.concepts.webhook.api;

import java.time.Instant;
import java.util.*;

public interface WebhookApi {
    Set<String> EVENTS = Set.of(
            "release.promoted",
            "release.flagged",
            "release.held",
            "page.published",
            "domain.verified",
            "delivery.completed",
            "delivery.failed");

    static boolean validConfiguration(String value, String scope, UUID id, Set<String> events) {
        if (value == null
                || value.length() > 2048
                || scope == null
                || events == null
                || events.isEmpty()
                || events.stream().anyMatch(Objects::isNull)
                || !EVENTS.containsAll(events)
                || !Set.of("tenant", "space", "site").contains(scope)
                || (scope.equals("tenant") ? id != null : id == null)) return false;
        try {
            var uri = new java.net.URI(value);
            return "https".equalsIgnoreCase(uri.getScheme())
                    && uri.getHost() != null
                    && uri.getUserInfo() == null
                    && uri.getFragment() == null
                    && (uri.getPort() == -1 || uri.getPort() > 0 && uri.getPort() <= 65535);
        } catch (java.net.URISyntaxException malformed) {
            return false;
        }
    }

    Created create(UUID tenant, String url, String scopeType, UUID scopeId, Set<String> events);

    Optional<Subscription> view(UUID id);

    List<Subscription> list(UUID before, int limit);

    void update(UUID id, String url, String scopeType, UUID scopeId, Set<String> events, boolean active);

    String rotate(UUID id);

    void capture(UUID tenant, Event event);

    List<Delivery> deliveries(UUID webhook, UUID before, int limit);

    List<Attempt> attempts(UUID delivery);

    boolean redeliver(UUID webhook, UUID delivery);

    List<Claim> claim(int limit);

    void finish(Claim claim, Integer status, String error, long durationMs);

    String secret(String encrypted);

    record Subscription(
            UUID id,
            UUID tenantId,
            String url,
            String scopeType,
            UUID scopeId,
            Set<String> events,
            boolean active,
            Instant createdAt) {}

    record Created(Subscription subscription, String secret) {}

    record Event(
            UUID id,
            String type,
            Instant time,
            UUID resourceId,
            UUID spaceId,
            UUID siteId,
            String outcome,
            String requestId) {}

    record Delivery(
            UUID id,
            UUID eventId,
            String eventType,
            String status,
            int attempts,
            Instant nextRunAt,
            Integer responseCode,
            Instant createdAt) {}

    record Attempt(UUID id, Instant startedAt, Integer responseCode, String error, Long durationMs) {}

    record Claim(
            UUID id,
            UUID webhookId,
            UUID eventId,
            UUID token,
            String url,
            String encryptedSecret,
            String payload,
            int attempt) {}
}
