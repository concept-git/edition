package io.edition.control.compositions.iam.membership;

import io.edition.concepts.mailoutbox.api.MailOutboxApi;
import io.edition.concepts.membership.api.MembershipEvents;
import java.util.Locale;
import java.util.Map;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

/** Membership.invite 的同事务持久效果：提交前先写加密 mail outbox。 */
@Component
class InviteMailOutbox {
    private final MailOutboxApi outbox;

    InviteMailOutbox(MailOutboxApi outbox) {
        this.outbox = outbox;
    }

    @EventListener
    void enqueue(MembershipEvents.InviteMailRequested request) {
        outbox.enqueue(
                MailOutboxApi.Kind.INVITATION,
                request.email(),
                Map.of(
                        "groupType", request.group().type().name().toLowerCase(Locale.ROOT),
                        "tenantId", request.group().tenantId().toString(),
                        "groupId", request.group().id().toString(),
                        "role", request.role().name().toLowerCase(Locale.ROOT),
                        "token", request.token()));
    }
}
