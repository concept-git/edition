package io.edition.control.compositions.iam.usererasure;

import static io.edition.control.compositions.iam.usererasure.UserErasureTypes.*;

import org.springframework.transaction.annotation.Transactional;

@org.springframework.stereotype.Service
public class SearchUsersUseCase {
    private final UserDirectory directory;

    SearchUsersUseCase(UserErasureDependencies dependencies) {
        this.directory = dependencies.directory;
    }

    @Transactional(readOnly = true)
    public UserPage searchUsers(String credential, String query, String cursor, int limit) {
        return directory.searchUsers(credential, query, cursor, limit);
    }
}
