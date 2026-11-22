package io.edition.contentapp.adapters.outbound;

import com.meilisearch.sdk.Client;
import com.meilisearch.sdk.IndexSearchRequest;
import com.meilisearch.sdk.MultiSearchFederation;
import com.meilisearch.sdk.MultiSearchRequest;
import com.meilisearch.sdk.exceptions.MeilisearchException;
import io.edition.contentapp.usecases.ports.SiteSearch;
import io.edition.delivery.contract.SearchSegment;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import tools.jackson.databind.json.JsonMapper;

public final class MeiliSiteSearch implements SiteSearch {
    private static final JsonMapper JSON = JsonMapper.builder().build();
    private final Client engine;

    public MeiliSiteSearch(Client engine) {
        this.engine = engine;
    }

    public boolean healthy() {
        try {
            return engine.isHealthy();
        } catch (MeilisearchException failure) {
            throw new Unavailable(failure);
        }
    }

    public List<Map<String, Object>> candidates(String storedIndex, String query, int offset) {
        try {
            var segments = JSON.readValue(storedIndex, SearchSegment[].class);
            var multi = new MultiSearchRequest();
            for (var segment : segments)
                multi.addQuery(new IndexSearchRequest(segment.indexUid())
                        .setQuery(query)
                        .setOffset(null)
                        .setLimit(null)
                        .setAttributesToRetrieve(new String[] {"pageId", "contentHash"})
                        .setAttributesToHighlight(new String[] {"body"})
                        .setAttributesToCrop(new String[] {"body"})
                        .setCropLength(35)
                        .setHighlightPreTag("<mark>")
                        .setHighlightPostTag("</mark>"));
            List<HashMap<String, Object>> hits = engine.multiSearch(
                            multi, new MultiSearchFederation().setLimit(32).setOffset(offset))
                    .getHits();
            return List.copyOf(hits);
        } catch (MeilisearchException failure) {
            throw new Unavailable(failure);
        }
    }
}
