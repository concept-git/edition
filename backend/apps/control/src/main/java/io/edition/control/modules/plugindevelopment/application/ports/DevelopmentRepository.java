package io.edition.control.modules.plugindevelopment.application.ports;

import io.edition.control.modules.plugindevelopment.api.*;
import java.util.*;

/** Storage contract owned by the concept application. */
public interface DevelopmentRepository {
    void insert(UUID id, String payload);

    Optional<String> find(UUID id, boolean lock);

    List<String> list();

    boolean exists(UUID id);

    void save(UUID id, String payload);

    void delete(UUID id);

    void candidate(UUID id, UUID development, String payload);

    List<String> candidates(UUID id);

    Optional<String> candidate(UUID development, UUID id);
}
