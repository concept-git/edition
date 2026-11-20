package io.space.control.compositions.auditing;

import static org.assertj.core.api.Assertions.assertThat;

import io.space.concepts.apitoken.api.ApiTokenApi;
import io.space.concepts.page.api.PageApi;
import io.space.concepts.password.api.PasswordApi;
import io.space.concepts.session.api.SessionApi;
import io.space.content.ContentProfile;
import java.util.UUID;
import org.junit.jupiter.api.Test;

class AuditActionFieldsTest {
    @Test
    void platformServicesDoNotEnterProductIdentityExtractionAfterPackageMoves() throws Exception {
        for (String name : java.util.List.of(
                "contenttype.application.ContentTypeService",
                "plugindevelopment.application.PluginDevelopmentService")) {
            Class<?> type = Class.forName("io.space.concepts." + name);
            var method = java.util.Arrays.stream(type.getDeclaredMethods())
                    .filter(m -> m.getName().equals("deactivate") || m.getName().equals("create"))
                    .findFirst()
                    .orElseThrow();
            assertThat(AuditActionFields.action(method, type)).as(name).isFalse();
        }
        Class<?> type = Class.forName("io.space.concepts.password.application.PasswordService");
        var set = type.getMethod("set", PasswordApi.AccountId.class, String.class);
        assertThat(AuditActionFields.action(set, type)).isTrue();
    }

    @Test
    void pageCreationMetadataIsNotAPreallocatedIdentity() {
        var profile = new ContentProfile("json-schema", null, null, null);
        var event = AuditActionFields.event(
                "fact",
                "Page.create",
                new Object[] {PageApi.Actor.system(), PageApi.Format.JSON, "Schema", profile},
                new PageApi.CreateResult.InvalidTitle(),
                "invalid_title");
        assertThat(event.targetType()).isEqualTo("page");
        assertThat(event.targetId()).isNull();
        UUID id = UUID.randomUUID();
        var allocated = AuditActionFields.event(
                "fact",
                "Page.create",
                new Object[] {PageApi.Actor.system(), PageApi.Format.JSON, "Schema", new PageApi.PageId(id)},
                new PageApi.CreateResult.IdTaken(),
                "id_taken");
        assertThat(allocated.targetId()).isEqualTo(id);
    }

    @Test
    void sessionEndTargetsTheSessionInsteadOfTheRequester() {
        UUID session = UUID.randomUUID(), requester = UUID.randomUUID();
        var event = AuditActionFields.event(
                "fact",
                "Session.end",
                new Object[] {new SessionApi.SessionId(session), new SessionApi.HolderId(requester)},
                null,
                "ok");
        assertThat(event.targetId()).isEqualTo(session);
        assertThat(event.targetType()).isEqualTo("session");
    }

    @Test
    void failedTokenIssueCannotInventAnIdentityFromItsSpaceBinding() {
        var event = AuditActionFields.event(
                "fact",
                "ApiToken.issue",
                new Object[] {UUID.randomUUID(), UUID.randomUUID(), UUID.randomUUID(), "CI", java.util.Set.of(), null},
                new ApiTokenApi.IssueResult.InvalidScope(),
                "invalid_scope");
        assertThat(event.targetId()).isNull();
    }

    @Test
    void rejectedOldPasswordIsRecordedAsFailure() {
        assertThat(AuditActionFields.outcome(new PasswordApi.ChangeResult.BadPassword()))
                .isEqualTo("bad_password");
    }
}
