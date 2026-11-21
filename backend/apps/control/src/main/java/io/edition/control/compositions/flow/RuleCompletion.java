package io.edition.control.compositions.flow;

import io.edition.control.compositions.RequestAuditContext;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;
import org.springframework.context.ApplicationEventPublisher;

/** Invocation-local execution record for synchronous, transactional completion relays. */
public final class RuleCompletion<T> {
    private final UUID flowId;
    private final UUID occurrenceId = UUID.randomUUID();
    private final Set<String> claims = new HashSet<>();
    private final java.util.concurrent.atomic.AtomicReference<Outcome<T>> outcome =
            new java.util.concurrent.atomic.AtomicReference<>();

    private record Outcome<T>(T value, RuntimeException failure) {}

    private RuleCompletion() {
        var root = RequestAuditContext.current().rootId();
        flowId = root == null ? UUID.randomUUID() : root;
    }

    public static <T> RuleCompletion<T> create() {
        return new RuleCompletion<>();
    }

    public UUID flowId() {
        return flowId;
    }

    public UUID occurrenceId() {
        return occurrenceId;
    }

    public synchronized boolean claim(String rule) {
        if (rule == null || rule.isBlank()) throw new IllegalArgumentException("A stable rule identity is required");
        return claims.add(rule);
    }

    public synchronized void complete(T result) {
        if (!outcome.compareAndSet(null, new Outcome<>(result, null)))
            throw new IllegalStateException("The invocation already has an outcome");
    }

    private synchronized void fail(RuntimeException rejected) {
        // A later failure never erases a completion already recorded for this occurrence.
        outcome.compareAndSet(null, new Outcome<>(null, rejected));
    }

    public synchronized T result() {
        var recorded = outcome.get();
        if (recorded == null) throw new IllegalStateException("No synchronization completed this invocation");
        if (recorded.failure() != null) throw recorded.failure();
        return recorded.value();
    }

    public T dispatch(ApplicationEventPublisher publisher, Object binding) {
        try {
            publisher.publishEvent(binding);
        } catch (FlowException
                | org.springframework.dao.DataAccessException
                | org.springframework.transaction.TransactionException rejected) {
            fail(rejected);
            throw rejected;
        }
        return result();
    }
}
