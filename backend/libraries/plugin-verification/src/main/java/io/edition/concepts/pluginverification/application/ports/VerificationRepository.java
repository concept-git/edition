package io.edition.concepts.pluginverification.application.ports;

import io.edition.concepts.pluginverification.api.*;
import java.util.*;

/** Storage contract owned by the concept application. */
public interface VerificationRepository {
    void insert(UUID id, UUID development, String payload);

    Optional<String> find(UUID id);

    List<String> list(UUID development);
}
