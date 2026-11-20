package io.space.control.compositions.hosting.reorganization;

import static io.space.control.compositions.hosting.reorganization.ReorganizationTypes.*;

/** Shared entry policy or read projection; no independent causal invocation. */
final class AddressFailures {

    private AddressFailures() {}

    static SlugTakenException slugTaken() {
        return new SlugTakenException();
    }
}
