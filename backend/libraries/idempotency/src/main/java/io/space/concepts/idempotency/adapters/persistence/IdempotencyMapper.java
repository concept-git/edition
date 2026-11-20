package io.space.concepts.idempotency.adapters.persistence;

import io.space.concepts.idempotency.api.*;
import java.time.Instant;
import java.util.UUID;
import org.apache.ibatis.annotations.Delete;
import org.apache.ibatis.annotations.Insert;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.Update;

@Mapper
interface IdempotencyMapper {

    @Delete("""
            delete from shared.idempotency_records
             where principal_type = #{principalType}
               and principal_id = #{principalId}
               and operation = #{operation}
               and idempotency_key = #{key}
               and expires_at <= #{now}
            """)
    int deleteScopeIfExpired(
            @Param("principalType") String principalType,
            @Param("principalId") UUID principalId,
            @Param("operation") String operation,
            @Param("key") String key,
            @Param("now") Instant now);

    @Insert("""
            insert into shared.idempotency_records (
              principal_type, principal_id, operation, idempotency_key,
              request_fingerprint, state, created_at, expires_at
            ) values (
              #{principalType}, #{principalId}, #{operation}, #{key},
              #{fingerprint}, 'processing', #{createdAt}, #{expiresAt}
            )
            on conflict (principal_type, principal_id, operation, idempotency_key) do nothing
            """)
    int insertProcessing(
            @Param("principalType") String principalType,
            @Param("principalId") UUID principalId,
            @Param("operation") String operation,
            @Param("key") String key,
            @Param("fingerprint") String fingerprint,
            @Param("createdAt") Instant createdAt,
            @Param("expiresAt") Instant expiresAt);

    @Select("""
            select request_fingerprint, state, response_status, response_body, response_content_type
              from shared.idempotency_records
             where principal_type = #{principalType}
               and principal_id = #{principalId}
               and operation = #{operation}
               and idempotency_key = #{key}
            """)
    Row find(
            @Param("principalType") String principalType,
            @Param("principalId") UUID principalId,
            @Param("operation") String operation,
            @Param("key") String key);

    @Update("""
            update shared.idempotency_records
               set state = 'completed',
                   response_status = #{status},
                   response_body = #{body},
                   response_content_type = #{contentType}
             where principal_type = #{principalType}
               and principal_id = #{principalId}
               and operation = #{operation}
               and idempotency_key = #{key}
               and state = 'processing'
            """)
    int complete(
            @Param("principalType") String principalType,
            @Param("principalId") UUID principalId,
            @Param("operation") String operation,
            @Param("key") String key,
            @Param("status") int status,
            @Param("body") String body,
            @Param("contentType") String contentType);

    @Delete("""
            delete from shared.idempotency_records
             where ctid in (
               select ctid
                 from shared.idempotency_records
                where expires_at <= #{cutoff}
                order by expires_at
                limit #{limit}
                for update skip locked
             )
            """)
    int deleteExpired(@Param("cutoff") Instant cutoff, @Param("limit") int limit);

    record Row(
            String requestFingerprint,
            String state,
            Integer responseStatus,
            String responseBody,
            String responseContentType) {}
}
