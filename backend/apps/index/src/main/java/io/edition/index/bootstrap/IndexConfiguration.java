package io.edition.index.bootstrap;

import com.meilisearch.sdk.Client;
import com.meilisearch.sdk.Config;
import io.edition.index.entry.persistence.IndexStore;
import javax.sql.DataSource;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import tools.jackson.databind.json.JsonMapper;

@org.springframework.context.annotation.Configuration(proxyBeanMethods = false)
public class IndexConfiguration {
    public @Bean IndexStore store(DataSource source, JsonMapper json) {
        var store = new IndexStore(source, json);
        store.verifyWriter();
        return store;
    }

    public @Bean Client searchClient(
            @Value("${index.search.url}") String url, @Value("${index.search.key}") String key) {
        return new Client(new Config(url, key));
    }
}
