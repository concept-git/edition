package io.edition.control.usecases.iam.usererasure;

import static io.edition.control.usecases.iam.usererasure.UserErasureTypes.*;

import io.edition.control.modules.user.api.UserApi;
import io.edition.control.usecases.flow.IdempotentFlowExecutor;
import org.springframework.transaction.annotation.Transactional;

@org.springframework.stereotype.Service
public class EraseSelfUseCase {

    private final UserErasureAccess access;
    private final UserErasureCascade cascade;
    private final IdempotentFlowExecutor idempotency;

    EraseSelfUseCase(UserErasureDependencies dependencies) {
        this.access = dependencies.access;
        this.cascade = dependencies.cascade;
        this.idempotency = dependencies.idempotency;
    }

    @Transactional(noRollbackFor = EraseConfirmationInvalidException.class)
    public void eraseSelf(String credential, String confirmationEmail, String currentPassword, String key) {
        UserApi.UserId user = access.resolveSelf(credential);
        access.confirmSelf(user, confirmationEmail, currentPassword);
        idempotency.execute(
                UserErasureCascade.userPrincipal(user),
                key,
                "user.erase-self",
                IdempotentFlowExecutor.canonical(confirmationEmail),
                () -> cascade.eraseSelf(user));
    }
}
