package io.edition.contentapp.bootstrap;

import com.meilisearch.sdk.Client;
import com.meilisearch.sdk.Config;
import io.edition.contentapp.entry.persistence.PublicationPages;
import io.minio.MinioClient;
import javax.sql.DataSource;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import tools.jackson.databind.json.JsonMapper;

@org.springframework.context.annotation.Configuration(proxyBeanMethods = false)
public class ContentConfiguration {
    public @Bean java.time.Clock clock() {
        return java.time.Clock.systemUTC();
    }

    @Bean
    PublicationPages publicationPages(DataSource source, JsonMapper json) {
        var pages = new PublicationPages(source, json);
        pages.verifyReader();
        return pages;
    }

    public @Bean Client searchClient(
            @Value("${delivery.search.url}") String url, @Value("${delivery.search.key}") String key) {
        return new Client(new Config(url, key));
    }

    public @Bean MinioClient objectClient(
            @Value("${delivery.objects.url}") String url,
            @Value("${delivery.objects.user}") String user,
            @Value("${delivery.objects.password}") String password) {
        return MinioClient.builder().endpoint(url).credentials(user, password).build();
    }
}
