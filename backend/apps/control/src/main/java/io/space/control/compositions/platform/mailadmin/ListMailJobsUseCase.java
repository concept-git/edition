package io.space.control.compositions.platform.mailadmin;

import static io.space.control.compositions.platform.mailadmin.MailAdminTypes.*;

import io.space.concepts.mailoutbox.api.MailDeliveryApi;
import io.space.control.compositions.*;
import io.space.shared.KeysetCursor;
import io.space.shared.PageWindow;
import java.util.UUID;

@org.springframework.stereotype.Service
public class ListMailJobsUseCase {
    private final MailDeliveryApi delivery;
    private final MailAdminAccess access;

    ListMailJobsUseCase(MailAdminDependencies dependencies) {
        this.delivery = dependencies.delivery;
        this.access = dependencies.access;
    }

    public MailJobPage listMailJobs(String credential, UUID tenant, String cursor, int limit) {
        var principal = access.require(credential, tenant);
        var before = access.cursor(cursor);
        int count = Math.min(100, Math.max(1, limit));
        var rows = delivery.list(tenant, before, count + 1);
        var window = PageWindow.of(rows, count, row -> KeysetCursor.encode(row.createdAt(), row.id()));
        return new MailJobPage(
                window.items().stream().map(row -> MailJob.from(row, principal)).toList(), window.nextCursor());
    }
}
