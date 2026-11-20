package io.space.concepts.user;

import static org.assertj.core.api.Assertions.assertThat;

import io.space.concepts.user.api.*;
import io.space.concepts.user.api.UserApi.RegisterResult;
import io.space.concepts.user.api.UserApi.VerifyResult;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.modulith.test.ApplicationModuleTest;
import org.springframework.modulith.test.PublishedEvents;
import org.springframework.test.annotation.DirtiesContext;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

@ApplicationModuleTest
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_CLASS)
@Testcontainers
@org.springframework.context.annotation.Import(io.space.concepts.user.adapters.UserConfiguration.class)
class UserModuleTest {

    @Container
    @ServiceConnection
    static final PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:18.6");

    @Autowired
    UserApi users;

    // OP: after register ("a@x.com", "Alice") : (u) then _byEmail ("a@x.com") : (u)
    @Test
    void afterRegisterTheEmailResolvesToTheNewUser(PublishedEvents events) {
        var result = users.register("alice@user-module.test", "Alice");

        assertThat(result).isInstanceOfSatisfying(RegisterResult.Registered.class, registered -> {
            assertThat(users.byEmail("alice@user-module.test")).contains(registered.user());
            assertThat(registered.verifyToken()).isNotBlank();
            assertThat(users.profile(registered.user())).contains(new UserApi.Profile("Alice", false));
        });
        assertThat(events.ofType(UserEvents.Registered.class)).hasSize(1);
    }

    @Test
    void registerRequiresAnUnclaimedEmailCaseInsensitively() {
        users.register("bob@user-module.test", "Bob");

        var duplicate = users.register("BOB@user-module.test", "Imposter");

        assertThat(duplicate).isInstanceOf(RegisterResult.EmailTaken.class);
    }

    // OP: after register : (u), verify (u, token) : (ok) then verified = true
    @Test
    void verifyRedeemsTheIssuedTokenExactlyOnce(PublishedEvents events) {
        var registered = (RegisterResult.Registered) users.register("carol@user-module.test", "Carol");

        var verified = users.verify(registered.user(), registered.verifyToken());

        assertThat(verified).isEqualTo(new VerifyResult.Verified(registered.user()));
        assertThat(users.profile(registered.user())).contains(new UserApi.Profile("Carol", true));
        assertThat(events.ofType(UserEvents.Verified.class)).hasSize(1);

        var replay = users.verify(registered.user(), registered.verifyToken());
        assertThat(replay).isInstanceOf(VerifyResult.Rejected.class);
    }

    @Test
    void verifyRejectsAForeignToken() {
        var registered = (RegisterResult.Registered) users.register("dave@user-module.test", "Dave");

        assertThat(users.verify(registered.user(), "forged-token")).isInstanceOf(VerifyResult.Rejected.class);
        assertThat(users.profile(registered.user())).contains(new UserApi.Profile("Dave", false));
    }

    @Test
    void tenantScopedSelectorsCanSearchWithATwoCharacterPrefix() {
        var registered = (RegisterResult.Registered) users.register("qz-selector@user-module.test", "Qz Selector");

        UserApi.SearchPage page = users.search("qz", null, 20);

        assertThat(page.users()).extracting(UserApi.SearchItem::id).contains(registered.user());
    }

    @Test
    void searchTreatsWildcardAndEscapeCharactersAsLiteralPrefixText() {
        users.register("ordinary@literal-search.test", "Ordinary");
        var percent = (RegisterResult.Registered) users.register("percent@literal-search.test", "%%% literal");
        var underscore = (RegisterResult.Registered) users.register("underscore@literal-search.test", "q_literal");
        users.register("not-underscore@literal-search.test", "qxliteral");
        var escape = (RegisterResult.Registered) users.register("escape@literal-search.test", "q\\literal");
        assertThat(users.search("%%%", null, 100).users())
                .extracting(UserApi.SearchItem::id)
                .containsExactly(percent.user());
        assertThat(users.search("q_", null, 100).users())
                .extracting(UserApi.SearchItem::id)
                .containsExactly(underscore.user());
        assertThat(users.search("q\\", null, 100).users())
                .extracting(UserApi.SearchItem::id)
                .containsExactly(escape.user());
    }

    @Test
    void deactivateReactivateAndEraseFollowTheIrreversibleStateMachine(PublishedEvents events) {
        var registered = (RegisterResult.Registered) users.register("erase@user-module.test", "Erase Me");

        assertThat(users.erase(registered.user())).isInstanceOf(UserApi.EraseResult.MustBeDeactivated.class);
        assertThat(users.deactivate(registered.user()))
                .isEqualTo(new UserApi.LifecycleResult.Ok(UserApi.Status.DEACTIVATED, true));
        assertThat(users.isActive(registered.user())).isFalse();
        assertThat(users.deactivate(registered.user()))
                .isEqualTo(new UserApi.LifecycleResult.Ok(UserApi.Status.DEACTIVATED, false));
        assertThat(users.reactivate(registered.user()))
                .isEqualTo(new UserApi.LifecycleResult.Ok(UserApi.Status.ACTIVE, true));
        users.deactivate(registered.user());
        assertThat(users.erase(registered.user())).isEqualTo(new UserApi.EraseResult.Ok(true));
        assertThat(users.erase(registered.user())).isEqualTo(new UserApi.EraseResult.Ok(false));

        UserApi.AccountProfile tombstone =
                users.accountProfile(registered.user()).orElseThrow();
        assertThat(tombstone.email()).isNull();
        assertThat(tombstone.name()).isEqualTo("已注销用户");
        assertThat(tombstone.verified()).isFalse();
        assertThat(tombstone.status()).isEqualTo(UserApi.Status.ERASED);
        assertThat(users.reactivate(registered.user())).isInstanceOf(UserApi.LifecycleResult.Erased.class);
        assertThat(events.ofType(UserEvents.Deactivated.class)).hasSize(2);
        assertThat(events.ofType(UserEvents.Erased.class)).hasSize(1);

        var replacement = (RegisterResult.Registered) users.register("erase@user-module.test", "Replacement");
        assertThat(replacement.user()).isNotEqualTo(registered.user());
        assertThat(users.accountProfile(registered.user()).orElseThrow().name()).isEqualTo("已注销用户");
    }
}
