package io.space.control.compositions.iam.registration;

import java.util.UUID;

/** Technical completion publication; synchronization is implemented by the receiving named rules. */
@org.springframework.stereotype.Component
final class RegistrationRelay {
    private final org.springframework.context.ApplicationEventPublisher events;

    RegistrationRelay(org.springframework.context.ApplicationEventPublisher events) {
        this.events = events;
    }

    public void acceptInviteOnRegister(UUID user, String email) {
        var completion = io.space.control.compositions.flow.RuleCompletion.<Void>create();
        completion.dispatch(events, new RegistrationSignals.AcceptInviteOnRegister(user, email, completion));
    }
}
