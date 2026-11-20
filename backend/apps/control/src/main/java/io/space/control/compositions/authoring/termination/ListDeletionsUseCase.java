package io.space.control.compositions.authoring.termination;

import static io.space.control.compositions.authoring.termination.TerminationTypes.*;

import io.space.concepts.deletionrecovery.api.DeletionRecoveryApi;
import io.space.control.compositions.access.TenantAccess;
import io.space.control.compositions.flow.InvalidCursorException;
import java.time.*;
import java.util.*;
import org.springframework.transaction.annotation.Transactional;

@org.springframework.stereotype.Service
public class ListDeletionsUseCase {

    private final TenantAccess tenants;

    private final DeletionRecoveryApi operations;

    ListDeletionsUseCase(TerminationDependencies dependencies) {
        this.tenants = dependencies.tenants;
        this.operations = dependencies.operations;
    }

    @Transactional(readOnly = true)
    public DeletionPage listDeletions(String credential, UUID tenant, UUID before, int limit) {
        if (limit < 1 || limit > 100) throw new InvalidCursorException();
        var principal = tenants.admitUser(credential, tenant);
        boolean admin = tenants.allows(principal, tenant, List.of(TenantAccess.tenant(tenant)), TenantAccess.ADMIN);
        return tenants.inTenant(tenant, () -> {
            var visible = new ArrayList<Deletion>();
            UUID cursor = before;
            while (visible.size() <= limit) {
                var batch = operations.deletions(cursor, 100);
                for (var record : batch) {
                    cursor = record.id();
                    if (admin || principal.principal().id().equals(record.actorId()))
                        visible.add(Deletion.from(record));
                    if (visible.size() > limit)
                        return new DeletionPage(
                                visible.subList(0, limit),
                                visible.get(limit - 1).id());
                }
                if (batch.size() < 100) break;
            }
            return new DeletionPage(visible, null);
        });
    }
}
