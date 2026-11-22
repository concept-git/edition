package io.edition.index.adapters.inbound;

import io.edition.index.usecases.SearchIndexer;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

/** Inbound triggers for index rebuild. The rule stays in the use case. */
@Component
public class IndexJobs {
    private final SearchIndexer indexer;

    public IndexJobs(SearchIndexer indexer) {
        this.indexer = indexer;
    }

    @Scheduled(fixedDelay = 200)
    public void poll() {
        indexer.poll();
    }

    @Scheduled(fixedDelay = 30000)
    public void cleanup() {
        indexer.cleanup();
    }
}
