package io.edition.index.adapters.readviews;

import io.edition.delivery.contract.SiteSnapshot;
import io.edition.index.usecases.SearchQueue;
import java.util.*;
import java.util.function.Supplier;
import javax.sql.DataSource;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.datasource.DataSourceTransactionManager;
import org.springframework.transaction.support.TransactionTemplate;
import tools.jackson.databind.json.JsonMapper;

/** Writer implementation is packaged only with the worker, never with the reader. */
public final class IndexStore implements SearchQueue {
    private final JdbcTemplate jdbc;
    private final TransactionTemplate transactions;
    private final JsonMapper json;

    public IndexStore(DataSource source, JsonMapper json) {
        this.jdbc = new JdbcTemplate(source);
        this.transactions = new TransactionTemplate(new DataSourceTransactionManager(source));
        this.json = json;
    }

    public List<SearchQueue.SearchTask> claimSearch(UUID token) {
        return jdbc.query(
                "select * from serving.claim_publication_search(?)",
                (r, n) -> new SearchQueue.SearchTask(
                        r.getObject("site_id", UUID.class),
                        r.getObject("tenant_id", UUID.class),
                        r.getLong("epoch"),
                        token,
                        r.getInt("attempts")),
                token);
    }

    public Optional<SearchQueue.SearchInput> searchInput(SearchQueue.SearchTask work) {
        return Optional.ofNullable(jdbc.queryForObject(
                        "select serving.publication_search_input(?,?,?)::text",
                        String.class,
                        work.site(),
                        work.epoch(),
                        work.token()))
                .map(payload -> json.readValue(payload, SearchQueue.SearchInput.class));
    }

    public List<SiteSnapshot.Page> searchPages(SearchQueue.SearchTask work, int offset, int limit) {
        return jdbc.query(
                "select payload::text from serving.publication_search_pages(?,?,?,?,?) payload",
                (r, n) -> json.readValue(r.getString(1), SiteSnapshot.Page.class),
                work.site(),
                work.epoch(),
                work.token(),
                offset,
                limit);
    }

    public String searchIndex(SearchQueue.SearchTask work) {
        return jdbc.queryForObject("select serving.publication_search_state(?)->>'index'", String.class, work.site());
    }

    public boolean renewSearch(SearchQueue.SearchTask work) {
        return inTenant(
                        work.tenant(),
                        () -> jdbc.update(
                                "update serving.search_jobs set lease_until=now()+interval '2 minutes'"
                                        + " where site_id=? and epoch=? and token=? and lease_until>now()",
                                work.site(),
                                work.epoch(),
                                work.token()))
                == 1;
    }

    public boolean completeSearch(
            SearchQueue.SearchTask work, List<io.edition.delivery.contract.SearchSegment> complete) {
        String payload = json.writeValueAsString(complete);
        return Boolean.TRUE.equals(jdbc.queryForObject(
                "select serving.finish_publication_search(?,?,?,?)",
                Boolean.class,
                work.site(),
                work.epoch(),
                work.token(),
                payload));
    }

    public void verifyWriter() {
        Boolean ready = jdbc.queryForObject("""
                select has_function_privilege(session_user,to_regprocedure('serving.claim_publication_search(uuid)'),'EXECUTE')
                   and has_function_privilege(session_user,to_regprocedure('serving.finish_publication_search(uuid,bigint,uuid,text)'),'EXECUTE')
                   and has_function_privilege(session_user,to_regprocedure('shared.record_service_heartbeat(text,text,text,jsonb)'),'EXECUTE')
                """, Boolean.class);
        if (!Boolean.TRUE.equals(ready))
            throw new IllegalStateException("search index database contract is unavailable");
        Boolean elevated = jdbc.queryForObject(
                "select rolsuper or rolbypassrls or rolcreatedb or rolcreaterole or"
                        + " rolreplication from pg_roles where rolname=session_user",
                Boolean.class);
        Boolean writer = jdbc.queryForObject(
                "select pg_has_role(session_user,'delivery_writer','MEMBER')"
                        + " and not coalesce(pg_has_role(session_user,to_regrole('delivery_fencer'),'MEMBER'),false) and not coalesce(pg_has_role(session_user,to_regrole('space_app'),'MEMBER'),false)",
                Boolean.class);
        if (Boolean.TRUE.equals(elevated) || !Boolean.TRUE.equals(writer))
            throw new IllegalStateException("index requires a restricted delivery writer login");
    }

    public <T> T inTenant(UUID tenant, Supplier<T> work) {
        return transactions.execute(status -> {
            jdbc.queryForObject("select set_config('app.tenant_id', ?, true)", String.class, tenant.toString());
            return work.get();
        });
    }

    public void rememberGarbage(String index) {
        jdbc.update(
                "insert into serving.index_garbage values(?,now()+interval '10 minutes') on conflict do nothing",
                index);
    }

    public void postponeGarbage(String index) {
        jdbc.update(
                "insert into serving.index_garbage values(?,now()+interval '2 minutes') on"
                        + " conflict(index_uid) do update set delete_after=excluded.delete_after",
                index);
    }

    public void failSearch(SearchQueue.SearchTask work, String code) {
        inTenant(
                work.tenant(),
                () -> jdbc.update(
                        "update serving.search_jobs set status=?,token=null,lease_until=null,error=?,next_run_at=now()+(?"
                                + " * interval '1 second') where site_id=? and epoch=? and token=?",
                        work.attempts() >= 8 ? "failed" : "retrying",
                        code,
                        Math.min(60, 1 << Math.min(work.attempts(), 6)),
                        work.site(),
                        work.epoch(),
                        work.token()));
    }

    public java.util.List<String> collectableIndexes() {
        return jdbc.queryForList("select index_uid from serving.collectable_indexes()", String.class);
    }

    public void deleteGarbage(String index) {
        jdbc.update("delete from serving.index_garbage where index_uid=?", index);
    }

    public void recordHeartbeat(String service, String instance, String version) {
        jdbc.queryForObject(
                "select shared.record_service_heartbeat(?,?,?,'{}'::jsonb)", Object.class, service, instance, version);
    }

    public JdbcTemplate indexJdbc() {
        return jdbc;
    }
}
