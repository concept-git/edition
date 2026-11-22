package io.edition.control.usecases.hosting.reorganization;

import static io.edition.control.usecases.hosting.reorganization.ReorganizationTypes.*;

/** Shared entry policy or read projection; no independent causal invocation. */
final class AddressFailures {

    private AddressFailures() {}

    static SlugTakenException slugTaken() {
        return new SlugTakenException();
    }
}
