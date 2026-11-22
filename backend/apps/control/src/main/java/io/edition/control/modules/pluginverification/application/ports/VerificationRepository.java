package io.edition.control.modules.pluginverification.application.ports;

import io.edition.control.modules.pluginverification.api.*;
import java.util.*;

/** Storage contract owned by the concept application. */
public interface VerificationRepository {
    void insert(UUID id, UUID development, String payload);

    Optional<String> find(UUID id);

    List<String> list(UUID development);
}
