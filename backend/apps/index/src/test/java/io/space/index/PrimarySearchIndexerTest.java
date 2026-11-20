package io.space.index;

import static org.assertj.core.api.Assertions.*;

import com.meilisearch.sdk.Client;
import com.meilisearch.sdk.Config;
import io.space.delivery.contract.SearchSegment;
import io.space.index.compositions.SearchIndexer;
import io.space.index.entry.persistence.IndexStore;
import java.nio.charset.StandardCharsets;
import java.util.*;
import org.junit.jupiter.api.Test;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.datasource.DataSourceTransactionManager;
import org.springframework.jdbc.datasource.DriverManagerDataSource;
import org.springframework.transaction.support.TransactionTemplate;
import org.testcontainers.containers.GenericContainer;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.containers.wait.strategy.Wait;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import tools.jackson.databind.json.JsonMapper;

@Testcontainers
class PrimarySearchIndexerTest {
    @Container
    static final PostgreSQLContainer<?> DATABASE = new PostgreSQLContainer<>("postgres:18.6");

    @Container
    static final GenericContainer<?> ENGINE = new GenericContainer<>("getmeili/meilisearch:v1.53")
            .withEnv("MEILI_MASTER_KEY", "source-search-integration-key")
            .withEnv("MEILI_NO_ANALYTICS", "true")
            .withEnv("MEILI_MAX_INDEXING_MEMORY", "256MiB")
            .withEnv("MEILI_MAX_INDEXING_THREADS", "2")
            .withExposedPorts(7700)
            .waitingFor(Wait.forHttp("/health"));

    private static final JsonMapper JSON = JsonMapper.builder().build();

    @Test
    void indexesCanonicalReleasesWithoutBodyReplicationAndDoesNotRebuildForAclChanges() throws Exception {
        var owner = new JdbcTemplate(
                new DriverManagerDataSource(DATABASE.getJdbcUrl(), DATABASE.getUsername(), DATABASE.getPassword()));
        for (String script : List.of(
                "V1__shared.sql",
                "V2__iam.sql",
                "V3__authoring.sql",
                "V4__releases.sql",
                "V5__hosting.sql",
                "V6__content_plugins.sql",
                "V7__content_types.sql",
                "V8__publication_read_view.sql",
                "V13__primary_search.sql")) {
            try (var input = Objects.requireNonNull(getClass().getResourceAsStream("/primary-db/" + script))) {
                owner.execute(new String(input.readAllBytes(), StandardCharsets.UTF_8));
            }
        }
        UUID tenant = UUID.randomUUID(), space = UUID.randomUUID(), site = UUID.randomUUID(), page = UUID.randomUUID();
        UUID first = UUID.randomUUID(), next = UUID.randomUUID();
        owner.update("insert into shared.tenants(id,name) values(?,'Search')", tenant);
        owner.update(
                "insert into authoring.spaces(id,tenant_id,name,mode) values(?,?,'Guide','authored')", space, tenant);
        owner.update("insert into hosting.sites(id,tenant_id,name) values(?,?,'Guide')", site, tenant);
        owner.update(
                "insert into hosting.site_mounts(site_id,space_id,slug,position) values(?,?,'docs',0)", site, space);
        owner.update(
                "insert into hosting.custom_domains(host,site_id,verified,is_primary,dns_token) values('search.example.test',?,true,true,'fixture')",
                site);
        owner.update(
                "insert into authoring.pages(id,tenant_id,title,format,created_by_type,updated_by_type) values(?,?,'Guide','txt','system','system')",
                page,
                tenant);
        owner.update(
                "insert into authoring.space_page_placements(space_id,page_id,slug) values(?,?,'guide')", space, page);
        owner.update(
                "insert into iam.permission_grants(tenant_id,resource_type,resource_id,principal_type,role) values(?,'site',?,'anonymous','reader')",
                tenant,
                site);
        release(owner, tenant, space, page, first, "live", "Published original");
        release(owner, tenant, space, page, next, "validated", "Replacement document");
        owner.execute("create role canonical_index_writer login password 'source-search-test' in role delivery_writer");
        var store = new IndexStore(
                new DriverManagerDataSource(DATABASE.getJdbcUrl(), "canonical_index_writer", "source-search-test"),
                JSON);
        var engine = new Client(new Config(
                "http://" + ENGINE.getHost() + ":" + ENGINE.getMappedPort(7700), "source-search-integration-key"));
        var worker = new SearchIndexer(store, engine, JSON);
        worker.poll();
        var original = index(owner, site);
        assertThat(engine.index(original).search("Published").getHits()).hasSize(1);
        assertThat(owner.queryForObject("select to_regclass('serving.pages') is null", Boolean.class))
                .isTrue();
        new TransactionTemplate(new DataSourceTransactionManager(owner.getDataSource())).executeWithoutResult(tx -> {
            owner.update("update releases.releases set status='archived' where id=?", first);
            owner.update("update releases.releases set status='live' where id=?", next);
        });
        worker.poll();
        String replacement = index(owner, site);
        assertThat(replacement).isNotEqualTo(original);
        assertThat(engine.index(replacement).search("Replacement").getHits()).hasSize(1);
        assertThat(engine.index(replacement).search("Published").getHits()).isEmpty();
        owner.update("delete from iam.permission_grants where tenant_id=?", tenant);
        worker.poll();
        assertThat(index(owner, site)).isEqualTo(replacement);
        assertThat(owner.queryForObject("select to_regclass('serving.pages') is null", Boolean.class))
                .isTrue();
    }

    private static String index(JdbcTemplate owner, UUID site) {
        String stored =
                owner.queryForObject("select search_index from serving.sites where site_id=?", String.class, site);
        assertThat(stored).isNotNull();
        return JSON.readValue(stored, SearchSegment[].class)[0].indexUid();
    }

    private static void release(
            JdbcTemplate owner, UUID tenant, UUID space, UUID page, UUID release, String status, String body)
            throws java.security.NoSuchAlgorithmException {
        owner.update(
                "insert into releases.releases(id,space_id,status,label,source_kind) values(?,?,?,'fixture','build')",
                release,
                space,
                status);
        String hash = HexFormat.of()
                .formatHex(java.security.MessageDigest.getInstance("SHA-256")
                        .digest(body.getBytes(StandardCharsets.UTF_8)));
        owner.update(
                "insert into releases.release_contents(tenant_id,content_hash,body) values(?,?,?)", tenant, hash, body);
        owner.update(
                "insert into releases.release_pages(tenant_id,release_id,page_id,slug,title,format,content_hash,seq) values(?,?,?,'guide','Guide','txt',?,0)",
                tenant,
                release,
                page,
                hash);
    }
}
