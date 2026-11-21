package io.edition.concepts.importjob.adapters.persistence;

import io.edition.concepts.importjob.api.*;
import java.time.Instant;
import java.util.UUID;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Options;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.Update;

@Mapper
interface ImportJobMapper {
    @org.apache.ibatis.annotations.Select("select shared.import_queue_depth()")
    long queueDepth();

    @Update(
            "update shared.jobs set payload=jsonb_set(coalesce(payload,'{}'::jsonb),'{report}',cast(#{report} as jsonb)) where id=#{id} and type='import'")
    void saveReport(@Param("id") UUID id, @Param("report") String report);

    String COLUMNS = """
            id, tenant_id as tenantId, space_id as spaceId, status, phase,
            progress_done as progressDone, progress_total as progressTotal, attempt,
            next_run_at as nextRunAt, outcome, release_id as releaseId,
            zip_sha256 as zipSha256, zip_key as zipKey, adapter_id as adapterId,
            payload->>'traceId' as traceId, created_at as createdAt,
            payload->>'sourceUrl' as sourceUrl, payload->>'report' as report
            """;

    @Select("""
            insert into shared.jobs (
              tenant_id, type, space_id, status, phase, release_id, zip_sha256, zip_key, payload)
            values (
              #{tenantId}, 'import', #{spaceId}, 'queued', 'queued', #{releaseId},
              #{zipSha256}, #{zipKey},
              jsonb_strip_nulls(jsonb_build_object('traceId', #{traceId}::text, 'sourceUrl', #{sourceUrl}::text)))
            returning\s""" + COLUMNS)
    @Options(flushCache = Options.FlushCachePolicy.TRUE)
    JobRow insert(
            @Param("tenantId") UUID tenantId,
            @Param("spaceId") UUID spaceId,
            @Param("releaseId") UUID releaseId,
            @Param("zipSha256") String zipSha256,
            @Param("zipKey") String zipKey,
            @Param("traceId") String traceId,
            @Param("sourceUrl") String sourceUrl);

    @Select("select " + COLUMNS + " from shared.jobs where id = #{id} and type = 'import'")
    JobRow find(@Param("id") UUID id);

    @Select("""
            select\s""" + COLUMNS + """
              from shared.jobs
             where id = #{id} and space_id = #{spaceId} and type = 'import'
            """)
    JobRow findBySpace(@Param("spaceId") UUID spaceId, @Param("id") UUID id);

    @Select("""
            select exists(
              select 1 from shared.jobs
               where space_id = #{spaceId} and type = 'import'
                 and status in ('queued', 'running', 'retrying'))
            """)
    boolean hasUnfinished(@Param("spaceId") UUID spaceId);

    @Select("select true from (select pg_advisory_xact_lock(hashtext('import:' || #{spaceId}::text))) locked")
    boolean advisoryLock(@Param("spaceId") UUID spaceId);

    @Select("""
            update shared.jobs
               set status = 'running', attempt = attempt + 1, payload=payload-'report',
                   phase = #{phase},
                   started_at = coalesce(started_at, now())
             where id = #{id} and type = 'import' and status in ('queued','running','retrying')
            returning\s""" + COLUMNS)
    @Options(flushCache = Options.FlushCachePolicy.TRUE)
    JobRow markRunning(@Param("id") UUID id, @Param("phase") String phase);

    @Update("""
            update shared.jobs
               set phase = #{phase},
                   progress_done = #{progressDone},
                   progress_total = #{progressTotal}
             where id = #{id} and type = 'import'
            """)
    int markProgress(
            @Param("id") UUID id,
            @Param("phase") String phase,
            @Param("progressDone") Integer progressDone,
            @Param("progressTotal") Integer progressTotal);

    @Select("""
            update shared.jobs
               set status = #{status},
                   outcome = #{outcome},
                   adapter_id = coalesce(#{adapterId}, adapter_id),
                   progress_done = case when #{outcome} = 'promoted' then progress_total else progress_done end,
                   finished_at = now()
             where id = #{id} and type = 'import' and status in ('queued','running','retrying')
            returning\s""" + COLUMNS)
    @Options(flushCache = Options.FlushCachePolicy.TRUE)
    JobRow complete(
            @Param("id") UUID id,
            @Param("status") String status,
            @Param("outcome") String outcome,
            @Param("adapterId") String adapterId);

    @Select("""
            update shared.jobs
               set status = 'retrying',
                   attempt = attempt + 1,
                   last_error_code = #{error},
                   next_run_at = #{nextRunAt}
             where id = #{id} and type = 'import' and status in ('queued','running','retrying')
            returning\s""" + COLUMNS)
    @Options(flushCache = Options.FlushCachePolicy.TRUE)
    JobRow retrying(@Param("id") UUID id, @Param("error") String error, @Param("nextRunAt") Instant nextRunAt);

    @Select("""
            update shared.jobs
               set status = 'failed',
                   outcome = #{outcome},
                   last_error_code = #{error},
                   finished_at = now()
             where id = #{id} and type = 'import' and status in ('queued','running','retrying')
            returning\s""" + COLUMNS)
    @Options(flushCache = Options.FlushCachePolicy.TRUE)
    JobRow fail(@Param("id") UUID id, @Param("outcome") String outcome, @Param("error") String error);

    record JobRow(
            UUID id,
            UUID tenantId,
            UUID spaceId,
            String status,
            String phase,
            Integer progressDone,
            Integer progressTotal,
            int attempt,
            Instant nextRunAt,
            String outcome,
            UUID releaseId,
            String zipSha256,
            String zipKey,
            String adapterId,
            String traceId,
            Instant createdAt,
            String sourceUrl,
            String report) {}

    @Update(
            "update shared.jobs set status='failed',outcome='resource_deleted',last_error_code='resource_deleted',payload=null,zip_key=null,finished_at=now(),next_run_at=null where space_id=#{space} and type='import' and status in ('queued','running','retrying')")
    void terminateSpace(@Param("space") UUID space);

    @Select("select exists(select 1 from shared.jobs where zip_key=#{key})")
    boolean referencesObject(@Param("key") String key);

    @Update("update shared.jobs set payload=null,zip_key=null where space_id=#{space} and type='import'")
    void clearPayloads(@Param("space") UUID space);

    @Select("select pg_try_advisory_xact_lock(hashtext('import:' || #{space}::text))")
    boolean tryAdvisoryLock(@Param("space") UUID space);

    @Select("select tenant_id::text, id::text from shared.pending_imports(#{limit})")
    java.util.List<PendingRow> pending(@Param("limit") int limit);

    @Select(
            "select " + COLUMNS
                    + " from shared.jobs where type='import' and (#{before}::uuid is null or id<#{before}) and (#{space}::uuid is null or space_id=#{space}) and (#{status}::text is null or status=#{status}) order by id desc limit #{limit}")
    java.util.List<JobRow> list(
            @Param("before") UUID before,
            @Param("space") UUID space,
            @Param("status") String status,
            @Param("limit") int limit);

    @Select(
            "select count(*) from shared.jobs where type='import' and (#{space}::uuid is null or space_id=#{space}) and (#{status}::text is null or status=#{status})")
    long count(@Param("space") UUID space, @Param("status") String status);

    @Update(
            "update shared.jobs set status='queued',next_run_at=now(),last_error_code=null,outcome=null where id=#{id} and type='import' and status='failed' and outcome<>'resource_deleted' and zip_key is not null")
    int retryFailed(@Param("id") UUID id);

    @Update(
            "update shared.jobs set status='retrying',last_error_code=#{error},next_run_at=#{next} where id=#{id} and type='import' and status='running' and attempt=#{attempt}")
    void retryAttempt(
            @Param("id") UUID id,
            @Param("error") String error,
            @Param("next") Instant next,
            @Param("attempt") int attempt);

    @Update(
            "update shared.jobs set status='failed',outcome=#{outcome},last_error_code=#{error},finished_at=now() where id=#{id} and type='import' and status='running' and attempt=#{attempt}")
    void failAttempt(
            @Param("id") UUID id,
            @Param("outcome") String outcome,
            @Param("error") String error,
            @Param("attempt") int attempt);

    record PendingRow(String tenantId, String id) {}

    @Select(
            "select coalesce(outcome,status) outcome,count(*) count from shared.jobs where type='import' and (#{space}::uuid is null or space_id=#{space}) and created_at>=#{from} and created_at<#{to} group by 1")
    java.util.List<OutcomeCount> outcomes(
            @Param("space") UUID space, @Param("from") Instant from, @Param("to") Instant to);

    record OutcomeCount(String outcome, long count) {}
}
