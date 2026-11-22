package io.edition.control.usecases.platform.mailadmin;

import static io.edition.control.usecases.platform.mailadmin.MailAdminTypes.*;

import io.edition.control.modules.mailoutbox.api.MailDeliveryApi;
import io.edition.control.usecases.*;
import io.edition.shared.KeysetCursor;
import io.edition.shared.PageWindow;
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
