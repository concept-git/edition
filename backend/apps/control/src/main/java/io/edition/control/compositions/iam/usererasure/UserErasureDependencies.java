package io.edition.control.compositions.iam.usererasure;

import static io.edition.control.compositions.iam.usererasure.UserErasureTypes.*;

import io.edition.control.compositions.flow.IdempotentFlowExecutor;

@org.springframework.stereotype.Component
final class UserErasureDependencies {
    final UserDirectory directory;
    final UserErasureAccess access;
    final UserErasureCascade cascade;
    final IdempotentFlowExecutor idempotency;

    UserErasureDependencies(
            UserDirectory directory,
            UserErasureAccess access,
            UserErasureCascade cascade,
            IdempotentFlowExecutor idempotency) {
        this.directory = directory;
        this.access = access;
        this.cascade = cascade;
        this.idempotency = idempotency;
    }
}
