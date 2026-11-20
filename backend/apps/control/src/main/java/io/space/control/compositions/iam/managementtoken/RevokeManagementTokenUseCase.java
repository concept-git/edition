package io.space.control.compositions.iam.managementtoken;

import static io.space.control.compositions.iam.managementtoken.ManagementTokenTypes.*;

import io.space.concepts.managementtoken.api.ManagementTokenApi;
import io.space.control.compositions.principal.PrincipalResolution;
import java.util.UUID;
import org.springframework.transaction.annotation.Transactional;

@org.springframework.stereotype.Service
public class RevokeManagementTokenUseCase {
    private final ManagementTokenApi tokens;
    private final PrincipalResolution principals;

    RevokeManagementTokenUseCase(ManagementTokenDependencies dependencies) {
        this.tokens = dependencies.tokens;
        this.principals = dependencies.principals;
    }

    @Transactional
    public void revokeManagementToken(String credential, UUID id) {
        tokens.revoke(id, principals.requireSessionUser(credential));
    }
}
