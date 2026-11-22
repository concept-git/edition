package io.edition.control.usecases.authoring.termination;

import static io.edition.control.usecases.authoring.termination.TerminationTypes.*;

import java.time.*;
import java.util.*;
import org.springframework.transaction.annotation.Transactional;

@org.springframework.stereotype.Service
public class PurgeExpiredUseCase {

    private final ExpiredTrashPurge expiredTrashPurge;

    PurgeExpiredUseCase(TerminationDependencies dependencies) {
        this.expiredTrashPurge = dependencies.expiredTrashPurge;
    }

    @Transactional
    public PurgeReport purgeExpired(UUID tenant) {
        return expiredTrashPurge.scan(tenant);
    }
}
