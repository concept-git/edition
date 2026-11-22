package io.edition.contentapp.usecases.ports;

import java.util.List;
import java.util.Map;

/** Search-engine reads owned by the content use cases. */
public interface SiteSearch {
    boolean healthy();

    List<Map<String, Object>> candidates(String storedIndex, String query, int offset);

    final class Unavailable extends RuntimeException {
        public Unavailable(Throwable cause) {
            super(cause);
        }
    }
}
