package io.space.control.compositions.iam.usererasure;

import static io.space.control.compositions.iam.usererasure.UserErasureTypes.*;

import io.space.concepts.user.api.UserApi;
import java.util.UUID;
import org.springframework.transaction.annotation.Transactional;

@org.springframework.stereotype.Service
public class UserDetailUseCase {
    private final UserDirectory directory;

    UserDetailUseCase(UserErasureDependencies dependencies) {
        this.directory = dependencies.directory;
    }

    @Transactional(readOnly = true)
    public UserDetail userDetail(String credential, UUID user) {
        return directory.userDetail(credential, new UserApi.UserId(user));
    }
}
