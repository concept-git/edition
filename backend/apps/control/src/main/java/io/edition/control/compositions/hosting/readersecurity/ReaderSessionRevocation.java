package io.edition.control.compositions.hosting.readersecurity;

import io.edition.concepts.password.api.PasswordEvents;
import io.edition.concepts.session.api.SessionEvents;
import java.util.*;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

/** Advances canonical reader revocation once per account and transaction. */
@Component
final class ReaderSessionRevocation {
    private final io.edition.concepts.user.api.UserApi users;

    ReaderSessionRevocation(io.edition.concepts.user.api.UserApi users) {
        this.users = users;
    }

    @EventListener
    void passwordSet(PasswordEvents.PasswordSet event) {
        include(event.user().value());
    }

    @EventListener
    void passwordChanged(PasswordEvents.PasswordChanged event) {
        include(event.user().value());
    }

    @EventListener
    void passwordReset(PasswordEvents.PasswordReset event) {
        include(event.user().value());
    }

    @EventListener
    void sessionsEnded(SessionEvents.HolderChanged event) {
        include(event.holder().value());
    }

    private void include(UUID user) {
        if (!TransactionSynchronizationManager.isSynchronizationActive())
            throw new IllegalStateException("reader revocation requires a primary transaction");
        @SuppressWarnings("unchecked")
        var pending = (Set<UUID>) TransactionSynchronizationManager.getResource(this);
        if (pending == null) {
            pending = new TreeSet<>();
            var captured = pending;
            TransactionSynchronizationManager.bindResource(this, pending);
            TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
                @Override
                public int getOrder() {
                    return -900;
                }

                @Override
                public void beforeCommit(boolean readOnly) {
                    for (UUID id : captured) {
                        users.revokeReaderSessions(new io.edition.concepts.user.api.UserApi.UserId(id));
                    }
                }

                @Override
                public void afterCompletion(int status) {
                    TransactionSynchronizationManager.unbindResourceIfPossible(ReaderSessionRevocation.this);
                }
            });
        }
        pending.add(user);
    }
}
