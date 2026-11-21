package io.edition.contentapp.entry.persistence;

import io.edition.contentapp.compositions.access.ContentIdentity.PublicationCredential;
import io.edition.contentapp.compositions.shared.ContentProblem;
import io.edition.contentapp.entry.observability.ContentAnalytics;
import io.edition.delivery.contract.SiteSnapshot;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.List;
import java.util.UUID;
import org.springframework.jdbc.core.JdbcTemplate;
import tools.jackson.databind.json.JsonMapper;

public final class PublicationPages {
    private final JdbcTemplate jdbc;
    private final JsonMapper json;

    public PublicationPages(javax.sql.DataSource source, JsonMapper json) {
        jdbc = new JdbcTemplate(source);
        this.json = json;
    }

    public void verifyReader() {
        var restricted = jdbc.queryForObject("""
                select not (role.rolsuper or role.rolbypassrls or role.rolcreatedb or role.rolcreaterole or role.rolreplication)
                  and pg_has_role(session_user,'space_publication_reader','MEMBER')
                  and not pg_has_role(session_user,'space_publication_view','MEMBER')
                  and not pg_has_role(session_user,'space_app','MEMBER')
                  and not exists (
                    select 1 from pg_roles writer where writer.rolname in
                      ('delivery_writer','delivery_fencer','delivery_outbox_worker','reader_state_writer')
                      and pg_has_role(session_user,writer.oid,'MEMBER')
                  )
                  and not exists (
                    select 1 from pg_class relation join pg_namespace schema on schema.oid=relation.relnamespace
                     where relation.relkind in ('r','p') and (
                       (schema.nspname in ('iam','authoring','releases','hosting','reader_state')
                         and has_any_column_privilege(session_user,relation.oid,'SELECT'))
                       or (schema.nspname !~ '^pg_' and schema.nspname<>'information_schema'
                         and (has_table_privilege(session_user,relation.oid,'INSERT,UPDATE,DELETE,TRUNCATE,TRIGGER,REFERENCES')
                           or has_any_column_privilege(session_user,relation.oid,'INSERT,UPDATE,REFERENCES')))
                     )
                  )
                from pg_roles role where role.rolname=session_user
                """, Boolean.class);
        if (!Boolean.TRUE.equals(restricted)) {
            throw new IllegalStateException("publication requires a restricted view-only login");
        }
        if (!Boolean.TRUE.equals(jdbc.queryForObject("""
                select has_function_privilege(session_user,
                  to_regprocedure('publication_v1.read_document(text,text,uuid,text,text)'), 'EXECUTE')
                """, Boolean.class))) {
            throw new IllegalStateException("publication read contract is unavailable");
        }
    }

    public MountRead mount(String host, String slug, PublicationCredential credential) {
        return jdbc.queryForObject(
                "select * from publication_v1.read_mount(?,?,?::uuid,?,?)",
                (row, index) -> {
                    traceSite(row);
                    String payload = row.getString("space");
                    return new MountRead(
                            row.getString("outcome"),
                            row.getString("snapshot"),
                            row.getString("binding"),
                            payload == null ? null : json.readValue(payload, SiteSnapshot.Space.class));
                },
                host,
                slug,
                credential.token(),
                credential.proof(),
                credential.session());
    }

    public NavigationRead<MachineDocument> machine(String host, String slug, PublicationCredential credential) {
        return jdbc.queryForObject(
                "select * from publication_v1.read_machine(?,?,?::uuid,?,?)",
                (row, index) -> {
                    traceSite(row);
                    String payload = row.getString("document");
                    String brand = row.getString("brand");
                    return new NavigationRead<>(
                            row.getString("outcome"),
                            row.getString("primary_host"),
                            brand == null ? null : json.readValue(brand, SiteSnapshot.Brand.class),
                            payload == null ? null : json.readValue(payload, MachineDocument.class));
                },
                host,
                slug,
                credential.token(),
                credential.proof(),
                credential.session());
    }

    public NavigationRead<SearchDocument> searchContext(
            String host, String slug, String snapshot, PublicationCredential credential) {
        return jdbc.queryForObject(
                "select * from publication_v1.read_search_context(?,?,?,?::uuid,?,?)",
                (row, index) -> {
                    traceSite(row);
                    String payload = row.getString("document");
                    String brand = row.getString("brand");
                    return new NavigationRead<>(
                            row.getString("outcome"),
                            row.getString("primary_host"),
                            brand == null ? null : json.readValue(brand, SiteSnapshot.Brand.class),
                            payload == null ? null : json.readValue(payload, SearchDocument.class));
                },
                host,
                slug,
                snapshot,
                credential.token(),
                credential.proof(),
                credential.session());
    }

    public List<SiteSnapshot.Page> searchPages(
            String host, List<UUID> ids, long revision, PublicationCredential credential) {
        String values = ids.stream().map(UUID::toString).collect(java.util.stream.Collectors.joining(",", "{", "}"));
        return jdbc.query(
                "select * from publication_v1.read_search_pages(?,?::uuid[],?,?::uuid,?,?)",
                (row, index) -> {
                    if (!"ok".equals(row.getString("outcome")))
                        throw ContentProblem.publication(row.getString("outcome"));
                    return json.readValue(row.getString("page"), SiteSnapshot.Page.class);
                },
                host,
                values,
                revision,
                credential.token(),
                credential.proof(),
                credential.session());
    }

    public List<FileEntry> files(
            String host,
            String slug,
            String snapshot,
            PublicationCredential credential,
            String after,
            int limit,
            String exact) {
        return jdbc.query(
                "select * from publication_v1.read_files(?,?,?,?::uuid,?,?,?,?,?)",
                (row, index) -> {
                    if (!"ok".equals(row.getString("outcome")))
                        throw ContentProblem.publication(row.getString("outcome"));
                    return json.readValue(row.getString("entry"), FileEntry.class);
                },
                host,
                slug,
                snapshot,
                credential.token(),
                credential.proof(),
                credential.session(),
                after,
                limit,
                exact);
    }

    public PageRead read(String host, String path, UUID token, String proof, String sessionProof) {
        return jdbc.queryForObject(
                "select outcome, primary_host, tenant_id, site_id, page::text from publication_v1.read_page(?, ?, ?::uuid, ?, ?)",
                (row, index) -> {
                    traceSite(row);
                    String payload = row.getString("page");
                    return new PageRead(
                            row.getString("outcome"),
                            row.getString("primary_host"),
                            payload == null ? null : json.readValue(payload, SiteSnapshot.Page.class));
                },
                host,
                path,
                token,
                proof,
                sessionProof);
    }

    public DocumentRead document(String host, String path, PublicationCredential credential) {
        return jdbc.queryForObject(
                """
                select outcome, primary_host, redirect_path, tenant_id, site_id, page::text, attachment::text, context::text
                  from publication_v1.read_document(?, ?, ?::uuid, ?, ?)
                """,
                (row, index) -> {
                    traceSite(row);
                    String payload = row.getString("page");
                    String context = row.getString("context");
                    String attachment = row.getString("attachment");
                    return new DocumentRead(
                            row.getString("outcome"),
                            row.getString("primary_host"),
                            row.getString("redirect_path"),
                            row.getObject("site_id", UUID.class),
                            payload == null ? null : json.readValue(payload, SiteSnapshot.Page.class),
                            attachment == null ? null : json.readValue(attachment, SiteSnapshot.Attachment.class),
                            context == null ? null : json.readValue(context, SiteDocument.class));
                },
                host,
                path,
                credential.token(),
                credential.proof(),
                credential.session());
    }

    public <T> NavigationRead<T> navigation(
            String host, String kind, String slug, PublicationCredential credentials, Class<T> documentType) {
        return jdbc.queryForObject(
                """
                select outcome, primary_host, tenant_id, site_id, brand::text, document::text
                from publication_v1.read_navigation(?, ?, ?, ?::uuid, ?, ?)
                """,
                (row, index) -> {
                    traceSite(row);
                    String brand = row.getString("brand");
                    String document = row.getString("document");
                    return new NavigationRead<>(
                            row.getString("outcome"),
                            row.getString("primary_host"),
                            brand == null ? null : json.readValue(brand, SiteSnapshot.Brand.class),
                            document == null ? null : json.readValue(document, documentType));
                },
                host,
                kind,
                slug,
                credentials.token(),
                credentials.proof(),
                credentials.session());
    }

    private static void traceSite(ResultSet row) throws SQLException {
        UUID site = row.getObject("site_id", UUID.class);
        if (site != null) ContentAnalytics.site(row.getObject("tenant_id", UUID.class), site);
    }

    public record PageAccess(UUID id, UUID spaceId, String path, boolean noIndex, String description) {}

    public record FileEntry(String path, String kind, List<SiteSnapshot.Page> owners, Long size, String sha256) {
        public SiteSnapshot.Page page() {
            return owners.getFirst();
        }
    }

    public record PageRead(String outcome, String primaryHost, SiteSnapshot.Page page) {}

    public record MachineDocument(List<SiteSnapshot.Space> spaces, List<PageAccess> pages) {}

    public record SearchDocument(
            UUID siteId,
            long revision,
            String binding,
            String searchKey,
            String indexedKey,
            String index,
            List<SiteSnapshot.Space> spaces,
            boolean hasRelease) {
        public String snapshot(UUID space) {
            return siteId + ":" + space + ":" + revision;
        }

        public boolean ready() {
            return index != null && searchKey.equals(indexedKey);
        }
    }

    public record MountRead(String outcome, String snapshot, String binding, SiteSnapshot.Space space) {}

    public record NavigationRead<T>(String outcome, String primaryHost, SiteSnapshot.Brand brand, T document) {}

    public record SiteDocument(SiteSnapshot.Brand brand, UUID home, long revision, List<SiteSnapshot.Space> spaces) {}

    public record DocumentRead(
            String outcome,
            String primaryHost,
            String redirectPath,
            UUID siteId,
            SiteSnapshot.Page page,
            SiteSnapshot.Attachment attachment,
            SiteDocument context) {}
}
