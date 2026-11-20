package io.space.control.compositions.hosting.sitedelivery;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.io.IOException;
import java.util.List;
import java.util.UUID;
import org.flywaydb.core.Flyway;
import org.flywaydb.core.api.configuration.FluentConfiguration;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.datasource.DataSourceTransactionManager;
import org.springframework.jdbc.datasource.DriverManagerDataSource;
import org.springframework.transaction.support.TransactionTemplate;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

@Testcontainers
class PublicDeliveryViewTest {
    @Container
    static final PostgreSQLContainer<?> POSTGRES = new PostgreSQLContainer<>("postgres:18.6");

    private static JdbcTemplate owner;
    private static JdbcTemplate readerA;
    private static JdbcTemplate readerB;

    @BeforeAll
    static void migrateToPreviousVersion() {
        owner = new JdbcTemplate(dataSource(POSTGRES.getUsername(), POSTGRES.getPassword()));
        migrations().target("7").load().migrate();
    }

    private static FluentConfiguration migrations() {
        return Flyway.configure()
                .dataSource(owner.getDataSource())
                .schemas("shared", "iam", "authoring", "releases", "hosting");
    }

    @Test
    void onlyCommittedPublicReleasesAreReadableByEitherLogin() throws IOException {
        var publicSite = site("public.example.test", true);
        var privateSite = site("private.example.test", false);
        owner.update(
                "insert into hosting.custom_domains (host, site_id, dns_token) "
                        + "values ('unverified.example.test', ?, 'test')",
                publicSite.site());
        UUID first = release(publicSite, "live", "Original published body");
        hiddenPage(publicSite, first);
        UUID next = release(publicSite, "validated", "Next published body");
        assertThat(owner.queryForObject("select to_regclass('publication_v1.public_pages')::text", String.class))
                .isNull();
        migrations().load().migrate();
        owner.execute("create role public_reader_a login password 'view-test-a' in role space_publication_reader");
        owner.execute("create role public_reader_b login password 'view-test-b' in role space_publication_reader");
        readerA = new JdbcTemplate(dataSource("public_reader_a", "view-test-a"));
        readerB = new JdbcTemplate(dataSource("public_reader_b", "view-test-b"));
        assertBody("Original published body");
        owner.update("update hosting.custom_domains set is_primary=true where host='public.example.test'");
        owner.update(
                "insert into hosting.custom_domains(host,site_id,verified,dns_token) values ('alias.example.test',?,true,'test')",
                publicSite.site());
        var mount = readerA.queryForMap("""
                select outcome,snapshot from publication_v1.read_mount('public.example.test','docs',null,null,null)
                """);
        assertThat(mount).containsEntry("outcome", "ok");
        assertThat(readerA.queryForMap("""
                select outcome,space from publication_v1.read_mount('alias.example.test','docs',?,'invalid',null)
                """, UUID.randomUUID()))
                .containsEntry("outcome", "invalid_token")
                .containsEntry("space", null);
        assertThat(readerA.queryForList("""
                select entry->>'path' as path from publication_v1.read_files(
                    'public.example.test','docs',?,null,null,null,'',100,null)
                where outcome='ok' order by entry->>'path'
                """, String.class, mount.get("snapshot")))
                .contains("/guide", "/images", "/images/diagram.png")
                .doesNotContain("/hidden");
        String previous = mount.get("snapshot").toString();
        new TransactionTemplate(new DataSourceTransactionManager(owner.getDataSource()))
                .executeWithoutResult(status -> {
                    owner.update("update hosting.sites set name='Transient' where id=?", publicSite.site());
                    status.setRollbackOnly();
                });
        assertThat(readerA.queryForObject("""
                select snapshot from publication_v1.read_mount('public.example.test','docs',null,null,null)
                """, String.class)).isEqualTo(previous);
        assertThat(navigation("public.example.test", "toc", null))
                .containsEntry("outcome", "ok")
                .hasEntrySatisfying(
                        "document",
                        value -> assertThat(value.toString())
                                .contains("Guide in the release", "/docs/guide")
                                .doesNotContain("Hidden label"));
        assertThat(navigation("public.example.test", "sitemap", null)).containsEntry("document", "[\"/docs/guide\"]");
        assertThat(readerA.queryForMap("""
                select outcome,document::text from publication_v1.read_machine('public.example.test',null,null,null,null)
                """))
                .containsEntry("outcome", "ok")
                .hasEntrySatisfying(
                        "document",
                        value -> assertThat(value.toString())
                                .contains("Guide in the release", "/docs/guide")
                                .doesNotContain("Hidden label", "/docs/hidden", "Original published body"));
        assertThat(readerA.queryForMap("""
                select outcome,document from publication_v1.read_machine('public.example.test',null,?,'wrong',null)
                """, UUID.randomUUID()))
                .containsEntry("outcome", "invalid_token")
                .containsEntry("document", null);
        assertThat(readerA.queryForMap("""
                select outcome,document->>'index' as index from publication_v1.read_search_context(
                    'public.example.test',null,null,null,null,null)
                """)).containsEntry("outcome", "ok").containsEntry("index", null);
        assertThat(readerA.queryForList(
                        """
                select page->>'path' from publication_v1.read_search_pages('public.example.test',?::uuid[],?,null,null,null)
                where outcome='ok'
                """, String.class, "{" + publicSite.page() + "}", Long.parseLong(previous.split(":")[2])))
                .containsExactly("/docs/guide");
        assertThat(readerA.queryForMap("""
                select outcome, page->>'content' as body, (context->'spaces'->0->'navigation')::text as nodes
                  from publication_v1.read_document('public.example.test','/docs/guide',null,null,null)
                """))
                .containsEntry("outcome", "ok")
                .containsEntry("body", "Original published body")
                .hasEntrySatisfying(
                        "nodes",
                        value -> assertThat(value.toString())
                                .contains("Guide in the release")
                                .doesNotContain("Hidden label"));
        owner.update(
                "insert into hosting.redirects(site_id,path,target_type,target_id,origin)"
                        + " values (?, '/legacy/*', 'page', ?, 'manual')",
                publicSite.site(),
                publicSite.page());
        assertThat(readerA.queryForMap("""
                select outcome,redirect_path from publication_v1.read_document('public.example.test','/legacy/part',null,null,null)
                """))
                .containsEntry("outcome", "path_redirect")
                .containsEntry("redirect_path", "/docs/guide/part");
        owner.update("update hosting.sites set home_space_id=? where id=?", publicSite.space(), publicSite.site());
        assertThat(readerA.queryForMap("""
                select outcome,page->>'content' as body
                from publication_v1.read_document('public.example.test','/',null,null,null)
                """))
                .containsEntry("outcome", "ok")
                .containsEntry("body", "Original published body");
        assertThat(readerA.queryForMap("""
                select outcome,redirect_path from publication_v1.read_document('public.example.test','/docs',null,null,null)
                """))
                .containsEntry("outcome", "home_redirect")
                .containsEntry("redirect_path", "/docs/guide");
        assertThat(navigation("unverified.example.test", "robots", null)).containsEntry("outcome", "site_not_found");
        assertThat(readerA.queryForMap("""
                select outcome,attachment->>'storageKey' as storage from publication_v1.read_document(
                    'public.example.test','/docs/images/diagram.png',null,null,null)
                """))
                .containsEntry("outcome", "attachment")
                .containsEntry("storage", "fixture-object");
        assertThat(readerA.queryForMap("""
                select outcome,attachment from publication_v1.read_document(
                    'private.example.test','/docs/images/diagram.png',null,null,null)
                """))
                .containsEntry("outcome", "forbidden")
                .containsEntry("attachment", null);
        verifyMachineReads(privateSite);
        verifyBrowserReads(privateSite);
        verifyPrimarySearch(publicSite);

        var transaction = new TransactionTemplate(new DataSourceTransactionManager(owner.getDataSource()));
        transaction.executeWithoutResult(status -> {
            promote(first, next);
            assertBody("Original published body");
        });
        assertBody("Next published body");
        assertThat(readerB.queryForObject("""
                select outcome from publication_v1.read_files('public.example.test','docs',?,null,null,null,'',100,null)
                """, String.class, previous)).isEqualTo("snapshot_changed");

        owner.update(
                "insert into iam.permission_restriction_scopes (tenant_id, resource_type, resource_id) "
                        + "values (?, 'page', ?)",
                publicSite.tenant(),
                publicSite.page());
        assertBody();
        transaction.executeWithoutResult(status -> promote(next, first));
        assertBody();

        assertThatThrownBy(() -> readerA.queryForList("select body from releases.release_contents"))
                .rootCause()
                .hasMessageContaining("permission denied");
        assertThat(readerB.queryForObject(
                        "select has_table_privilege('publication_v1.public_pages', 'DELETE')", Boolean.class))
                .isFalse();
        assertThatThrownBy(() -> readerB.update("delete from releases.release_contents"))
                .rootCause()
                .hasMessageContaining("permission denied");
    }

    private static void verifyPrimarySearch(Fixture site) {
        owner.execute("create role source_index_worker login password 'search-test' in role delivery_writer");
        var worker = new JdbcTemplate(dataSource("source_index_worker", "search-test"));
        UUID token = UUID.randomUUID();
        var job = claimSearch(worker, site.site(), token);
        long epoch = ((Number) job.get("epoch")).longValue();
        assertThat(worker.queryForObject(
                        "select serving.publication_search_input(?,?,?)::text",
                        String.class,
                        site.site(),
                        epoch,
                        token))
                .contains("fields", "pageCount")
                .doesNotContain("Original published body", "Next published body");
        assertThat(worker.queryForList(
                                "select payload::text from serving.publication_search_pages(?,?,?,0,1000) payload",
                                String.class,
                                site.site(),
                                epoch,
                                token)
                        .toString())
                .contains("Original published body")
                .doesNotContain("Next published body");
        assertThatThrownBy(() -> worker.queryForList("select body from releases.release_contents"))
                .rootCause()
                .hasMessageContaining("permission denied");
        assertThat(worker.queryForObject(
                        "select serving.finish_publication_search(?,?,?,?)",
                        Boolean.class,
                        site.site(),
                        epoch,
                        token,
                        "[]"))
                .isTrue();
        assertThat(
                        readerA.queryForMap(
                                "select document->>'index' as index,document->>'searchKey'=document->>'indexedKey' as ready from publication_v1.read_search_context('public.example.test',null,null,null,null,null)"))
                .containsEntry("index", "[]")
                .containsEntry("ready", true);
        assertThat(worker.queryForObject(
                        "select serving.finish_publication_search(?,?,?,?)",
                        Boolean.class,
                        site.site(),
                        epoch,
                        token,
                        "[]"))
                .isFalse();
        String originalKey = owner.queryForObject("select publication_v1.search_key(?)", String.class, site.site());
        owner.update(
                "delete from authoring.space_page_placements where space_id=? and page_id=?",
                site.space(),
                site.page());
        assertThat(owner.queryForObject("select publication_v1.search_key(?)", String.class, site.site()))
                .isNotEqualTo(originalKey);
        owner.update(
                "insert into authoring.space_page_placements(space_id,page_id,slug) values(?,?,'guide')",
                site.space(),
                site.page());
        owner.update(
                "insert into hosting.search_settings(site_id,tenant_id,fields,revision) values(?,?,array['body','title','headings'],1)",
                site.site(),
                site.tenant());
        UUID replacement = UUID.randomUUID();
        var pending = claimSearch(worker, site.site(), replacement);
        assertThat(pending).containsEntry("site_id", site.site());
        owner.update("update hosting.search_settings set revision=2 where site_id=?", site.site());
        assertThat(worker.queryForObject(
                        "select serving.finish_publication_search(?,?,?,?)",
                        Boolean.class,
                        site.site(),
                        ((Number) pending.get("epoch")).longValue(),
                        replacement,
                        "[]"))
                .isFalse();
        assertThat(readerA.queryForObject(
                        "select (document->>'searchKey')=(document->>'indexedKey') from publication_v1.read_search_context('public.example.test',null,null,null,null,null)",
                        Boolean.class))
                .isFalse();
    }

    private static java.util.Map<String, Object> claimSearch(JdbcTemplate worker, UUID site, UUID token) {
        for (int i = 0; i < 3; i++) {
            var jobs = worker.queryForList("select site_id,epoch from serving.claim_publication_search(?)", token);
            if (!jobs.isEmpty() && site.equals(jobs.getFirst().get("site_id"))) return jobs.getFirst();
        }
        throw new AssertionError("site search job was not claimable");
    }

    private static void verifyBrowserReads(Fixture site) throws IOException {
        UUID user = UUID.randomUUID();
        UUID manager = UUID.randomUUID();
        UUID team = UUID.randomUUID();
        UUID session = UUID.randomUUID();
        String credential = "rs1_" + "C".repeat(43);
        owner.update(
                "insert into iam.users (id, email, name, verified) values (?, 'browser@example.test', 'Browser', true)",
                user);
        owner.update(
                "insert into iam.users (id, email, name, verified) values (?, 'manager@example.test', 'Manager', true)",
                manager);
        owner.update(
                "insert into iam.teams (id, tenant_id, name, normalized_name) values (?, ?, 'Browser', 'browser')",
                team,
                site.tenant());
        owner.update(
                """
                insert into iam.memberships(tenant_id,group_type,group_id,member_id,role)
                values (?, 'tenant', ?, ?, 'owner'), (?, 'tenant', ?, ?, 'member'),
                       (?, 'team', ?, ?, 'owner'), (?, 'team', ?, ?, 'member')
                """,
                site.tenant(),
                site.tenant(),
                manager,
                site.tenant(),
                site.tenant(),
                user,
                site.tenant(),
                team,
                manager,
                site.tenant(),
                team,
                user);
        owner.update("""
                insert into iam.permission_grants(tenant_id,resource_type,resource_id,principal_type,principal_id,role)
                values (?, 'space', ?, 'team', ?, 'reader')
                """, site.tenant(), site.space(), team);
        owner.update("""
                insert into reader_state.sessions(session_id,site_id,user_id,host,access_hash,refresh_hash,
                    access_expires_at,expires_at,identity_epoch)
                values (?, ?, ?, 'private.example.test', encode(sha256(convert_to(?, 'UTF8')), 'hex'), 'fixture',
                    now() + interval '10 minutes', now() + interval '1 day', 0)
                """, session, site.site(), user, credential);

        assertBrowser(credential, "ok", "Private published body");
        assertThat(navigation("private.example.test", "toc", null)).containsEntry("outcome", "forbidden");
        assertThat(navigation("private.example.test", "toc", credential))
                .containsEntry("outcome", "ok")
                .hasEntrySatisfying(
                        "document", value -> assertThat(value.toString()).contains("/docs/guide"));
        assertBrowser("rs1_" + "D".repeat(43), "reader_session_invalid", null);
        assertThatThrownBy(() -> readerA.queryForList("select * from reader_state.sessions"))
                .rootCause()
                .hasMessageContaining("permission denied");
        owner.update("""
                insert into iam.permission_grants(tenant_id,resource_type,resource_id,principal_type,principal_id,role)
                values (?, 'space', ?, 'user', ?, 'none')
                """, site.tenant(), site.space(), user);
        assertBrowser(credential, "forbidden", null);
        owner.update("delete from iam.permission_grants where principal_type='user' and principal_id=?", user);
        owner.update("delete from iam.memberships where group_type='team' and member_id=?", user);
        assertBrowser(credential, "forbidden", null);
        assertThat(navigation("private.example.test", "toc", credential)).containsEntry("outcome", "forbidden");
        owner.update(
                "insert into iam.memberships(tenant_id,group_type,group_id,member_id,role)"
                        + " values (?, 'team', ?, ?, 'member')",
                site.tenant(),
                team,
                user);
        assertBrowser(credential, "ok", "Private published body");
        assertThat(owner.queryForObject("select to_regclass('reader_state.user_security') is null", Boolean.class))
                .isTrue();
        assertBrowser(credential, "ok", "Private published body");
        owner.update("update iam.users set reader_epoch=reader_epoch+1 where id=?", user);
        assertBrowser(credential, "reader_session_invalid", null);
        owner.update("update reader_state.sessions set identity_epoch=1 where session_id=?", session);
        assertBrowser(credential, "ok", "Private published body");
        owner.update("update reader_state.sessions set access_expires_at=now() where session_id=?", session);
        assertBrowser(credential, "reader_access_expired", null);
        owner.update(
                "update reader_state.sessions set access_expires_at=now()+interval '10 minutes' where session_id=?",
                session);
        owner.update("update iam.users set status='deactivated' where id=?", user);
        assertBrowser(credential, "reader_session_invalid", null);
        owner.update("update iam.users set status='active' where id=?", user);
        owner.update("update reader_state.sessions set ended_at=now() where session_id=?", session);
        assertBrowser(credential, "reader_session_invalid", null);
    }

    private static java.util.Map<String, Object> navigation(String host, String kind, String credential) {
        return readerA.queryForMap("""
                select outcome, document::text from publication_v1.read_navigation(
                  ?, ?, 'docs', null, null, encode(sha256(convert_to(?, 'UTF8')), 'hex'))
                """, host, kind, credential);
    }

    private static void hiddenPage(Fixture site, UUID release) {
        UUID hidden = UUID.randomUUID();
        owner.update("""
                insert into authoring.pages(id,tenant_id,title,format,created_by_type,updated_by_type)
                values (?, ?, 'Private page', 'markdown', 'system', 'system')
                """, hidden, site.tenant());
        owner.update(
                "insert into authoring.space_page_placements(space_id,page_id,slug) values (?, ?, 'hidden')",
                site.space(),
                hidden);
        owner.update("""
                insert into releases.release_pages(
                    tenant_id,release_id,page_id,slug,title,format,content_hash,seq,external_id)
                select tenant_id,release_id,?,'hidden','Private page',format,content_hash,1,'absent-ref'
                  from releases.release_pages where release_id=? and page_id=?
                """, hidden, release, site.page());
        owner.update("""
                insert into iam.permission_grants(tenant_id,resource_type,resource_id,principal_type,role)
                values (?, 'page', ?, 'anonymous', 'none')
                """, site.tenant(), hidden);
    }

    private static void assertBrowser(String credential, String outcome, String content) {
        for (var reader : List.of(readerA, readerB))
            assertThat(reader.queryForMap("""
                    select outcome,page->>'content' as body
                    from publication_v1.read_page('private.example.test','/docs/guide',null,null,
                                                  encode(sha256(convert_to(?, 'UTF8')), 'hex'))
                    """, credential))
                    .containsEntry("outcome", outcome)
                    .containsEntry("body", content);
    }

    private static void verifyMachineReads(Fixture site) {
        UUID ownerId = UUID.randomUUID();
        UUID token = UUID.randomUUID();
        String secret = "A".repeat(43);
        owner.update("insert into iam.users (id, email, name) values (?, 'machine@example.test', 'Machine')", ownerId);
        owner.update("""
                insert into iam.api_tokens (id, tenant_id, owner_id, name, space_id, secret_hash, scopes, expires_at)
                values (?, ?, ?, 'fixture', ?, sha256(convert_to(?, 'UTF8')), array['read'], now() + interval '1 day')
                """, token, site.tenant(), ownerId, site.space(), secret);
        grantToken(site, token, "reader");
        assertThat(readPage("private.example.test", token, secret))
                .containsEntry("outcome", "ok")
                .containsEntry("body", "Private published body");
        assertThat(readPage("private.example.test", token, "B".repeat(43)))
                .containsEntry("outcome", "invalid_token")
                .containsEntry("body", null);
        assertThat(readPage("public.example.test", token, secret))
                .containsEntry("outcome", "invalid_token")
                .containsEntry("body", null);
        assertThat(readPage("private.example.test", null, null))
                .containsEntry("outcome", "forbidden")
                .containsEntry("body", null);
        assertThat(readPage("public.example.test", null, null)).containsEntry("body", "Original published body");

        owner.update("update iam.api_tokens set scopes = array['write'] where id = ?", token);
        assertThat(readPage("private.example.test", token, secret)).containsEntry("outcome", "forbidden");
        owner.update("update iam.api_tokens set scopes = array['read'] where id = ?", token);
        owner.update("update iam.permission_grants set role = 'none' where principal_id = ?", token);
        assertThat(readPage("private.example.test", token, secret)).containsEntry("outcome", "forbidden");
        owner.update("update iam.api_tokens set revoked_at = now() where id = ?", token);
        assertThat(readPage("private.example.test", token, secret))
                .containsEntry("outcome", "invalid_token")
                .containsEntry("body", null);
    }

    private static void grantToken(Fixture site, UUID token, String role) {
        owner.update("""
                insert into iam.permission_grants (tenant_id, resource_type, resource_id, principal_type, principal_id, role)
                values (?, 'space', ?, 'token', ?, ?)
                """, site.tenant(), site.space(), token, role);
    }

    private static java.util.Map<String, Object> readPage(String host, UUID token, String secret) {
        return readerA.queryForMap("""
                select outcome, page->>'content' as body
                  from publication_v1.read_page(?, '/docs/guide', ?::uuid, encode(sha256(convert_to(?, 'UTF8')), 'hex'))
                """, host, token, secret);
    }

    private static void assertBody(String... expected) {
        String query = "select body from publication_v1.public_pages where host in "
                + "('public.example.test', 'private.example.test', 'unverified.example.test') and path = '/docs/guide'";
        for (var reader : List.of(readerA, readerB))
            assertThat(reader.queryForList(query, String.class)).containsExactly(expected);
    }

    private static void promote(UUID current, UUID target) {
        owner.update("update releases.releases set status = 'archived' where id = ?", current);
        owner.update("update releases.releases set status = 'live' where id = ?", target);
    }

    private static Fixture site(String host, boolean anonymous) {
        var fixture = new Fixture(UUID.randomUUID(), UUID.randomUUID(), UUID.randomUUID(), UUID.randomUUID());
        owner.update("insert into shared.tenants (id, name) values (?, ?)", fixture.tenant(), host);
        owner.update(
                "insert into authoring.spaces (id, tenant_id, name, mode) values (?, ?, 'Docs', 'authored')",
                fixture.space(),
                fixture.tenant());
        owner.update(
                "insert into hosting.sites (id, tenant_id, name) values (?, ?, ?)",
                fixture.site(),
                fixture.tenant(),
                host);
        owner.update(
                "insert into hosting.custom_domains (host, site_id, verified, dns_token) "
                        + "values (?, ?, true, 'test')",
                host,
                fixture.site());
        owner.update(
                "insert into hosting.site_mounts (site_id, slug, space_id, position) values (?, 'docs', ?, 0)",
                fixture.site(),
                fixture.space());
        owner.update(
                "insert into authoring.pages (id, tenant_id, title, format, created_by_type, updated_by_type)"
                        + " values (?, ?, 'Guide', 'markdown', 'system', 'system')",
                fixture.page(),
                fixture.tenant());
        owner.update(
                "insert into authoring.space_page_placements (space_id, page_id, slug) values (?, ?, 'guide')",
                fixture.space(),
                fixture.page());
        if (anonymous)
            owner.update(
                    "insert into iam.permission_grants (tenant_id, resource_type, resource_id, principal_type, role) "
                            + "values (?, 'site', ?, 'anonymous', 'reader')",
                    fixture.tenant(),
                    fixture.site());
        else release(fixture, "live", "Private published body");
        return fixture;
    }

    private static UUID release(Fixture site, String state, String body) {
        UUID release = UUID.randomUUID();
        String hash = UUID.randomUUID().toString();
        owner.update(
                "insert into releases.releases (id, space_id, status, label, source_kind) "
                        + "values (?, ?, ?, 'test', 'build')",
                release,
                site.space(),
                state);
        owner.update(
                "insert into releases.release_contents (tenant_id, content_hash, body) values (?, ?, ?)",
                site.tenant(),
                hash,
                body);
        owner.update(
                "insert into releases.release_pages (tenant_id, release_id, page_id, slug, title, format, content_hash, seq, external_id, attachments) "
                        + "values (?, ?, ?, 'guide', 'Guide', 'markdown', ?, 0, 'guide-ref',"
                        + "'[{\"path\":\"images/diagram.png\",\"storageKey\":\"fixture-object\",\"sha256\":\"fixture-hash\"}]'::jsonb)",
                site.tenant(),
                release,
                site.page(),
                hash);
        owner.update("""
                insert into releases.release_toc(release_id,tree) values (?, '[
                    {"kind":"GROUP","label":"Chapter","children":[
                      {"kind":"TARGET","label":"Guide in the release","ref":"guide-ref"},
                      {"kind":"TARGET","label":"Hidden label","ref":"absent-ref"}
                    ]}]'::jsonb)
                """, release);
        return release;
    }

    private static DriverManagerDataSource dataSource(String username, String password) {
        return new DriverManagerDataSource(POSTGRES.getJdbcUrl(), username, password);
    }

    private record Fixture(UUID tenant, UUID site, UUID space, UUID page) {}
}
