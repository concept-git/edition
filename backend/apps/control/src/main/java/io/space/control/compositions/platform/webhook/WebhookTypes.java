package io.space.control.compositions.platform.webhook;

import static io.space.control.compositions.platform.webhook.WebhookTypes.*;

import io.space.concepts.webhook.api.WebhookApi;
import io.space.control.compositions.flow.IdempotentFlowExecutor;
import java.time.Instant;
import java.util.*;

/** Public composition inputs, results, and finite refusal types. */
public final class WebhookTypes {
    private WebhookTypes() {}

    public record Configuration(String url, String scopeType, UUID scopeId, Set<String> events, boolean active) {
        String canonical() {
            return IdempotentFlowExecutor.canonical(
                    url,
                    scopeType,
                    scopeId,
                    events == null ? null : events.stream().sorted().toList(),
                    active);
        }
    }

    public record Subscription(
            UUID id,
            String url,
            String scopeType,
            UUID scopeId,
            Set<String> events,
            boolean active,
            Instant createdAt) {
        static Subscription of(WebhookApi.Subscription s) {
            return new Subscription(s.id(), s.url(), s.scopeType(), s.scopeId(), s.events(), s.active(), s.createdAt());
        }
    }

    public record SecretResult(Subscription subscription, String secret) {}

    public record SubscriptionPage(List<Subscription> items, UUID nextCursor, Set<String> eventTypes) {}

    public record Attempt(UUID id, Instant startedAt, Integer responseCode, String error, Long durationMs) {}

    public record Delivery(
            UUID id,
            UUID eventId,
            String eventType,
            String status,
            int attempts,
            Instant nextRunAt,
            Integer responseCode,
            Instant createdAt,
            List<Attempt> history) {}

    public record DeliveryPage(List<Delivery> items, UUID nextCursor) {}
}
