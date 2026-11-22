package io.edition.control.usecases.iam.usererasure;

import static io.edition.control.usecases.iam.usererasure.UserErasureTypes.*;

import io.edition.control.modules.user.api.UserApi;
import io.edition.control.usecases.flow.IdempotentFlowExecutor;
import java.util.UUID;
import org.springframework.transaction.annotation.Transactional;

@org.springframework.stereotype.Service
public class ReactivateUserUseCase {

    private final UserErasureAccess access;
    private final UserErasureCascade cascade;
    private final IdempotentFlowExecutor idempotency;

    ReactivateUserUseCase(UserErasureDependencies dependencies) {
        this.access = dependencies.access;
        this.cascade = dependencies.cascade;
        this.idempotency = dependencies.idempotency;
    }

    @Transactional
    public void reactivateUser(String credential, UUID user, String key) {
        UserApi.UserId operator = access.requireOperator(credential);
        UserApi.UserId target = new UserApi.UserId(user);
        idempotency.execute(
                UserErasureCascade.userPrincipal(operator),
                key,
                "user.reactivate",
                IdempotentFlowExecutor.canonical(user),
                () -> cascade.reactivate(target));
    }
}
