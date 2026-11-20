package io.space.control.compositions.hosting.customdomain;

import static io.space.control.compositions.hosting.customdomain.CustomDomainTypes.*;

/** Shared entry policy or read projection; no independent causal invocation. */
final class DomainFailures {

    private DomainFailures() {}

    static void bindTaken() {
        throw new DomainTakenException();
    }

    static void verifyFailed() {
        throw new DomainNotProvenException();
    }
}
