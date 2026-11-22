package io.edition.index.adapters.outbound;

import com.meilisearch.sdk.Client;
import com.meilisearch.sdk.exceptions.MeilisearchException;
import com.meilisearch.sdk.model.Pagination;
import com.meilisearch.sdk.model.Settings;
import com.meilisearch.sdk.model.TaskInfo;
import io.edition.index.usecases.SearchEngine;
import java.util.List;

public final class MeiliSearchEngine implements SearchEngine {
    private final Client client;

    public MeiliSearchEngine(Client client) {
        this.client = client;
    }

    public Task createIndex(String uid, String primaryKey) {
        try {
            return task(client.createIndex(uid, primaryKey));
        } catch (MeilisearchException failure) {
            throw new Unavailable(failure);
        }
    }

    public Task updateSettings(String index, List<String> searchable, int maxTotalHits) {
        var settings = new Settings()
                .setSearchableAttributes(searchable.toArray(String[]::new))
                .setSortableAttributes(new String[] {"pageId"})
                .setRankingRules(new String[] {"words", "typo", "proximity", "attribute", "exactness", "pageId:asc"})
                .setPagination(new Pagination(Math.max(1000, maxTotalHits)));
        try {
            return task(client.index(index).updateSettings(settings));
        } catch (MeilisearchException failure) {
            throw new Unavailable(failure);
        }
    }

    public Task addDocuments(String index, String json) {
        try {
            return task(client.index(index).addDocuments(json, "pageId"));
        } catch (MeilisearchException failure) {
            throw new Unavailable(failure);
        }
    }

    public Task deleteIndex(String index) {
        try {
            return task(client.deleteIndex(index));
        } catch (MeilisearchException failure) {
            throw new Unavailable(failure);
        }
    }

    public TaskView task(int uid) {
        try {
            var task = client.getTask(uid);
            Status status =
                    switch (task.getStatus()) {
                        case SUCCEEDED -> Status.SUCCEEDED;
                        case FAILED -> Status.FAILED;
                        case CANCELED -> Status.CANCELED;
                        default -> Status.PENDING;
                    };
            String code = task.getError() == null ? null : task.getError().getCode();
            return new TaskView(status, code);
        } catch (MeilisearchException failure) {
            throw new Unavailable(failure);
        }
    }

    private static Task task(TaskInfo info) {
        return new Task(info.getTaskUid());
    }
}
