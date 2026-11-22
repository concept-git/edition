package io.edition.index.usecases;

import java.util.List;

/** Meilisearch operations the index rule needs. The outbound adapter implements this. */
public interface SearchEngine {
    Task createIndex(String uid, String primaryKey);

    Task updateSettings(String index, List<String> searchable, int maxTotalHits);

    Task addDocuments(String index, String json);

    Task deleteIndex(String index);

    TaskView task(int uid);

    record Task(int uid) {}

    record TaskView(Status status, String errorCode) {}

    enum Status {
        SUCCEEDED,
        FAILED,
        CANCELED,
        PENDING
    }

    final class Unavailable extends RuntimeException {
        public Unavailable(Throwable cause) {
            super(cause);
        }
    }
}
