package io.edition.concepts.contenttype.application.ports;

import io.edition.concepts.contenttype.api.*;
import java.util.*;

/** Storage contract owned by the concept application. */
public interface ContentTypeRepository {
    void serialize(String type);

    Optional<String> state(String type);

    List<String> states();

    void state(String type, String payload);

    void version(UUID id, String type, String version, String payload);

    Optional<String> version(UUID id);

    Optional<String> matching(String type, String digest);

    boolean versionExists(String type, String label);

    List<String> versions(String type);
}
