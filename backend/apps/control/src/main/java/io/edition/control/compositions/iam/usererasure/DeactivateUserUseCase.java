package io.edition.control.compositions.iam.usererasure;

import static io.edition.control.compositions.iam.usererasure.UserErasureTypes.*;

import io.edition.concepts.user.api.UserApi;
import io.edition.control.compositions.flow.IdempotentFlowExecutor;
import java.util.UUID;
import org.springframework.transaction.annotation.Transactional;

@org.springframework.stereotype.Service
public class DeactivateUserUseCase {

    private final UserErasureAccess access;
    private final UserErasureCascade cascade;
    private final IdempotentFlowExecutor idempotency;

    DeactivateUserUseCase(UserErasureDependencies dependencies) {
        this.access = dependencies.access;
        this.cascade = dependencies.cascade;
        this.idempotency = dependencies.idempotency;
    }

    @Transactional(noRollbackFor = EraseConfirmationInvalidException.class)
    public void deactivateUser(
            String credential, UUID user, String confirmationEmail, String currentPassword, String key) {
        UserApi.UserId operator = access.requireOperator(credential);
        UserApi.UserId target = new UserApi.UserId(user);
        access.confirmOperatorAction(operator, target, confirmationEmail, currentPassword, false);
        idempotency.execute(
                UserErasureCascade.userPrincipal(operator),
                key,
                "user.deactivate",
                IdempotentFlowExecutor.canonical(user, confirmationEmail),
                () -> cascade.deactivate(target));
    }
}
