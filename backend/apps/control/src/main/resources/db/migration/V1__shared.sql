-- ===== capability: global bootstrap and runtime roles =====
create extension if not exists citext with schema public;
do $$ begin
  if not exists (select 1 from pg_roles where rolname='space_app') then create role space_app nologin nosuperuser nocreatedb nocreaterole noreplication nobypassrls; end if;
  if not exists (select 1 from pg_roles where rolname='delivery_outbox_worker') then create role delivery_outbox_worker nologin; end if;
end $$;
alter role space_app nologin nosuperuser nocreatedb nocreaterole noreplication nobypassrls;
comment on role space_app is 'Space 业务组角色；必须由非 owner、非 superuser、NOBYPASSRLS 的登录角色继承';

-- ===== context: shared kernel and platform conventions =====
--
-- PostgreSQL database dump
--


-- Dumped from database version 18.6 (Debian 18.6-1.pgdg13+2)
-- Dumped by pg_dump version 18.6 (Debian 18.6-1.pgdg13+2)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: shared; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA IF NOT EXISTS shared;


-- ===== capability: shared runtime APIs =====
--
-- Name: append_audit(uuid, uuid, text, text, uuid, text, text, uuid, text, text, text, jsonb, uuid); Type: FUNCTION; Schema: shared; Owner: -
--

CREATE FUNCTION shared.append_audit(event uuid, root uuid, event_kind text, actor_kind text, actor uuid, action_name text, target_kind text, target uuid, result text, network text, request text, summary jsonb, requested_tenant uuid, platform_scope boolean DEFAULT false, credential uuid DEFAULT NULL) RETURNS bigint
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'pg_catalog'
    AS $$
declare tenant uuid; result_id bigint;
begin
  tenant=case when platform_scope then null else coalesce(nullif(current_setting('app.tenant_id',true),'')::uuid,requested_tenant) end;
  if actor is not null then
    perform pg_advisory_xact_lock(hashtextextended('audit-actor:'||actor::text,0));
    if exists(select 1 from shared.audit_redacted_actors where actor_id=actor) then network=null;summary=null;end if;
  end if;
  insert into shared.audit_log(event_id,root_id,kind,tenant_id,actor_type,actor_id,action,target_type,target_id,outcome,ip,request_id,change_summary,credential_id)
    values(event,root,event_kind,tenant,actor_kind,actor,action_name,target_kind,target,result,network::inet,request,summary,credential)
    on conflict(event_id) do nothing returning id into result_id;
  return result_id;
end $$;


SET default_tablespace = '';

SET default_table_access_method = heap;

-- ===== capability: shared platform state =====
--
-- Name: audit_exports; Type: TABLE; Schema: shared; Owner: -
--

CREATE TABLE shared.audit_exports (
    id uuid NOT NULL,
    tenant_id uuid,
    actor_id uuid NOT NULL,
    filters jsonb NOT NULL,
    cutoff timestamp with time zone NOT NULL,
    status text DEFAULT 'queued'::text NOT NULL,
    object_key text,
    error text,
    lease_token uuid,
    lease_until timestamp with time zone,
    attempts integer DEFAULT 0 NOT NULL,
    next_run_at timestamp with time zone DEFAULT now() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    expires_at timestamp with time zone DEFAULT (now() + '01:00:00'::interval) NOT NULL,
    CONSTRAINT audit_exports_status_check CHECK ((status = ANY (ARRAY['queued'::text, 'running'::text, 'retrying'::text, 'failed'::text, 'completed'::text])))
);

ALTER TABLE ONLY shared.audit_exports FORCE ROW LEVEL SECURITY;


--
-- Name: TABLE audit_exports; Type: COMMENT; Schema: shared; Owner: -
--

COMMENT ON TABLE shared.audit_exports IS 'rls:tenant/direct-nullable; tenant exports and platform-only exports';


--
-- Name: claim_audit_exports(); Type: FUNCTION; Schema: shared; Owner: -
--

CREATE FUNCTION shared.claim_audit_exports() RETURNS SETOF shared.audit_exports
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'pg_catalog'
    AS $$
declare target uuid;
begin
 select id into target from shared.audit_exports where expires_at>now() and ((status in ('queued','retrying') and next_run_at<=now()) or (status='running' and lease_until<now())) order by created_at for update skip locked limit 1;
 if target is null then return;end if;
 return query update shared.audit_exports set status='running',lease_token=uuidv7(),lease_until=now()+interval '90 seconds',attempts=attempts+1 where id=target returning *;
end $$;


--
-- Name: delivery_publications; Type: TABLE; Schema: shared; Owner: -
--

CREATE TABLE shared.delivery_publications (
    site_id uuid NOT NULL,
    tenant_id uuid NOT NULL,
    epoch bigint NOT NULL,
    payload jsonb NOT NULL,
    status text DEFAULT 'queued'::text NOT NULL,
    token uuid,
    lease_until timestamp with time zone,
    attempts integer DEFAULT 0 NOT NULL,
    next_run_at timestamp with time zone DEFAULT now() NOT NULL,
    last_error text,
    applied_epoch bigint,
    applied_releases jsonb DEFAULT '{}'::jsonb NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT delivery_publications_status_check CHECK ((status = ANY (ARRAY['queued'::text, 'running'::text, 'retrying'::text, 'failed'::text, 'completed'::text])))
);

ALTER TABLE ONLY shared.delivery_publications FORCE ROW LEVEL SECURITY;


--
-- Name: TABLE delivery_publications; Type: COMMENT; Schema: shared; Owner: -
--

COMMENT ON TABLE shared.delivery_publications IS 'rls:tenant/direct; durable site publication and receipt';

-- Platform health exposes global counts, never tenant rows or publication payloads.
CREATE FUNCTION shared.delivery_publication_health()
    RETURNS TABLE(backlog bigint, recent_failures bigint)
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'pg_catalog'
    AS $$
 SELECT count(*) FILTER (WHERE status IN ('queued', 'retrying')),
        count(*) FILTER (WHERE status = 'failed' AND updated_at > now() - interval '24 hours')
 FROM shared.delivery_publications
$$;

REVOKE ALL ON FUNCTION shared.delivery_publication_health() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION shared.delivery_publication_health() TO space_app;


--
-- Name: claim_delivery_publication(uuid); Type: FUNCTION; Schema: shared; Owner: -
--

CREATE FUNCTION shared.claim_delivery_publication(p_token uuid) RETURNS SETOF shared.delivery_publications
    LANGUAGE sql SECURITY DEFINER
    SET search_path TO 'pg_catalog'
    AS $$
 update shared.delivery_publications set status='running',token=p_token,
 lease_until=now()+interval '2 minutes',attempts=attempts+1,updated_at=now()
 where site_id=(select site_id from shared.delivery_publications
 where ((status in ('queued','retrying') and next_run_at<=now()) or (status='running' and lease_until<now()))
 order by next_run_at,site_id for update skip locked limit 1) returning *
$$;


--
-- Name: reader_security_publications; Type: TABLE; Schema: shared; Owner: -
--

CREATE TABLE shared.reader_security_publications (
    kind text NOT NULL,
    scope_id uuid NOT NULL,
    tenant_id uuid NOT NULL,
    epoch bigint NOT NULL,
    payload jsonb NOT NULL,
    status text DEFAULT 'queued'::text NOT NULL,
    token uuid,
    lease_until timestamp with time zone,
    attempts integer DEFAULT 0 NOT NULL,
    next_run_at timestamp with time zone DEFAULT now() NOT NULL,
    last_error text,
    applied_epoch bigint,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT reader_security_publications_kind_check CHECK (kind = 'policy'),
    CONSTRAINT reader_security_publications_status_check CHECK ((status = ANY (ARRAY['queued'::text, 'running'::text, 'retrying'::text, 'failed'::text, 'completed'::text])))
);


--
-- Name: TABLE reader_security_publications; Type: COMMENT; Schema: shared; Owner: -
--

COMMENT ON TABLE shared.reader_security_publications IS 'rls:infrastructure/derived reader security delivery intentions; worker narrow access only';


--
-- Name: claim_reader_security(uuid); Type: FUNCTION; Schema: shared; Owner: -
--

CREATE FUNCTION shared.claim_reader_security(p_token uuid) RETURNS SETOF shared.reader_security_publications
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'pg_catalog'
    AS $$
begin
 update shared.reader_security_publications set status='failed',last_error='attempts_exhausted',token=null,lease_until=null
 where status='running' and lease_until<=now() and attempts>=8;
 return query update shared.reader_security_publications p
 set status='running',token=p_token,lease_until=now()+interval '2 minutes',attempts=attempts+1,updated_at=now()
 where (kind,scope_id)=(select x.kind,x.scope_id from shared.reader_security_publications x
  where ((x.status in ('queued','retrying') and x.next_run_at<=now()) or (x.status='running' and x.lease_until<=now()))
    and x.attempts<8 order by next_run_at,kind,scope_id for update skip locked limit 1)
 returning p.*;
end $$;


--
-- Name: claim_webhooks(integer); Type: FUNCTION; Schema: shared; Owner: -
--

CREATE FUNCTION shared.claim_webhooks(batch_limit integer) RETURNS TABLE(id uuid, webhook_id uuid, event_id uuid, lease_token uuid, url text, secret text, payload text, auto_attempts integer)
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'pg_catalog'
    AS $$
declare claimed record;
begin
 update shared.webhook_deliveries exhausted set status='failed',lease_token=null,lease_until=null,
   next_retry_at=null
 where exhausted.auto_attempts>=8 and ((exhausted.status='running' and exhausted.lease_until<now()) or exhausted.status in ('queued','retrying'));
 for claimed in
  select d.id from shared.webhook_deliveries d join shared.webhooks w on w.id=d.webhook_id
  where w.active and d.auto_attempts<8 and ((d.status in ('queued','retrying') and coalesce(d.next_retry_at,now())<=now()) or (d.status='running' and d.lease_until<now()))
  order by d.created_at,d.id for update of d skip locked limit least(batch_limit,8)
 loop
  update shared.webhook_deliveries d set status='running',lease_token=uuidv7(),lease_until=now()+interval '90 seconds',attempts=d.attempts+1,auto_attempts=d.auto_attempts+1 where d.id=claimed.id;
  insert into shared.webhook_attempts(id,delivery_id) select d.lease_token,d.id from shared.webhook_deliveries d where d.id=claimed.id;
  return query select d.id,d.webhook_id,d.event_id,d.lease_token,w.url,w.secret,d.payload::text,d.auto_attempts from shared.webhook_deliveries d join shared.webhooks w on w.id=d.webhook_id where d.id=claimed.id;
 end loop;
end $$;


--
-- Name: current_tenant_id_or_null(); Type: FUNCTION; Schema: shared; Owner: -
--

CREATE FUNCTION shared.current_tenant_id_or_null() RETURNS uuid
    LANGUAGE sql STABLE
    SET search_path TO 'pg_catalog'
    AS $$
  select nullif(btrim(current_setting('app.tenant_id', true)), '')::uuid
$$;


--
-- Name: FUNCTION current_tenant_id_or_null(); Type: COMMENT; Schema: shared; Owner: -
--

COMMENT ON FUNCTION shared.current_tenant_id_or_null() IS '读取事务级 app.tenant_id；仅供 Tenant 归属列默认值，缺失时返回 NULL';


--
-- Name: finish_audit_export(uuid, uuid, text, text); Type: FUNCTION; Schema: shared; Owner: -
--

CREATE FUNCTION shared.finish_audit_export(target uuid, token uuid, key text, reason text) RETURNS void
    LANGUAGE sql SECURITY DEFINER
    SET search_path TO 'pg_catalog'
    AS $$
 update shared.audit_exports set object_key=key,error=reason,lease_token=null,lease_until=null,
 status=case when reason is null then 'completed' when attempts<8 and reason='dependency_unavailable' then 'retrying' else 'failed' end,
 next_run_at=now()+interval '1 minute' where id=target and lease_token=token and status='running'
$$;


--
-- Name: finish_delivery_publication(uuid, bigint, uuid, text); Type: FUNCTION; Schema: shared; Owner: -
--

CREATE FUNCTION shared.finish_delivery_publication(p_site uuid, p_epoch bigint, p_token uuid, p_error text) RETURNS boolean
    LANGUAGE sql SECURITY DEFINER
    SET search_path TO 'pg_catalog'
    AS $$
 with changed as (update shared.delivery_publications set
 status=case when p_error is null then 'completed' when attempts>=8 then 'failed' else 'retrying' end,
 applied_epoch=case when p_error is null then p_epoch else applied_epoch end,
 applied_releases=case when p_error is null then
 (select coalesce(jsonb_object_agg(s->>'id',s->'releaseId'),'{}'::jsonb) from jsonb_array_elements(payload->'spaces') s)
 else applied_releases end,
 token=null,lease_until=null,last_error=left(p_error,500),
 next_run_at=now()+least(60,power(2,least(attempts,6))) * interval '1 second', updated_at=now()
 where site_id=p_site and epoch=p_epoch and token=p_token returning 1)
 select exists(select 1 from changed)
$$;


--
-- Name: finish_reader_security(text, uuid, bigint, uuid, text, boolean); Type: FUNCTION; Schema: shared; Owner: -
--

CREATE FUNCTION shared.finish_reader_security(p_kind text, p_scope uuid, p_epoch bigint, p_token uuid, p_error text, p_retry boolean) RETURNS void
    LANGUAGE sql SECURITY DEFINER
    SET search_path TO 'pg_catalog'
    AS $$
 update shared.reader_security_publications set
  status=case when p_error is null then 'completed' when p_retry and attempts<8 then 'retrying' else 'failed' end,
  applied_epoch=case when p_error is null then p_epoch else applied_epoch end,
  next_run_at=now()+make_interval(secs=>least(60,power(2,least(attempts,6)))+random()),
  last_error=p_error,token=null,lease_until=null,updated_at=now()
 where kind=p_kind and scope_id=p_scope and epoch=p_epoch and token=p_token and status='running'
$$;


--
-- Name: finish_webhook(uuid, uuid, integer, text, bigint); Type: FUNCTION; Schema: shared; Owner: -
--

CREATE FUNCTION shared.finish_webhook(delivery uuid, token uuid, result_code integer, error_code text, duration bigint) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'pg_catalog'
    AS $$
declare retries int;
begin
 select auto_attempts into retries from shared.webhook_deliveries where id=delivery and lease_token=token and status='running' for update;
 if not found then return;end if;
 update shared.webhook_attempts set response_code=result_code,error=error_code,duration_ms=duration where id=token;
 update shared.webhook_deliveries set response_code=result_code,lease_token=null,lease_until=null,
 status=case when result_code between 200 and 299 then 'completed'
  when retries<8 and (result_code is null or result_code=429 or result_code>=500) and coalesce(error_code,'') not in ('destination_rejected','unexpected_error') then 'retrying' else 'failed' end,
 next_retry_at=now()+make_interval(secs=>least(900,power(2,retries)::int*5)+floor(random()*5)::int)
 where id=delivery;
end $$;


--
-- Name: forbid_update(); Type: FUNCTION; Schema: shared; Owner: -
--

CREATE FUNCTION shared.forbid_update() RETURNS trigger
    LANGUAGE plpgsql
    SET search_path TO 'pg_catalog'
    AS $$
begin
  raise exception using
    errcode = '42501',
    message = format('immutable snapshot table %s.%s forbids UPDATE',
                     tg_table_schema, tg_table_name);
end;
$$;


--
-- Name: FUNCTION forbid_update(); Type: COMMENT; Schema: shared; Owner: -
--

COMMENT ON FUNCTION shared.forbid_update() IS 'ADR-0008 不可变纪律：Release 快照表禁止 UPDATE（应用层零更新语句 + DB 触发器双保险）';


--
-- Name: group_belongs_to_current_tenant(text, uuid); Type: FUNCTION; Schema: shared; Owner: -
--

CREATE FUNCTION shared.group_belongs_to_current_tenant(requested_group_type text, requested_group_id uuid) RETURNS boolean
    LANGUAGE sql STABLE
    SET search_path TO 'pg_catalog'
    AS $$
  select case requested_group_type
    when 'tenant' then requested_group_id = shared.require_tenant_id()
    when 'team' then exists (
      select 1
        from iam.teams as team
       where team.id = requested_group_id
         and team.tenant_id = shared.require_tenant_id()
    )
    else false
  end
$$;


--
-- Name: FUNCTION group_belongs_to_current_tenant(requested_group_type text, requested_group_id uuid); Type: COMMENT; Schema: shared; Owner: -
--

COMMENT ON FUNCTION shared.group_belongs_to_current_tenant(requested_group_type text, requested_group_id uuid) IS 'RLS 写入完整性：Tenant/Team group 必须属于当前 app.tenant_id';


--
-- Name: import_queue_depth(); Type: FUNCTION; Schema: shared; Owner: -
--

CREATE FUNCTION shared.import_queue_depth() RETURNS bigint
    LANGUAGE sql SECURITY DEFINER
    SET search_path TO 'pg_catalog'
    AS $$
 select count(*) from shared.jobs where type='import' and status in ('queued','retrying')
$$;


--
-- Name: pending_bundle_exports(integer); Type: FUNCTION; Schema: shared; Owner: -
--

CREATE FUNCTION shared.pending_bundle_exports(p_limit integer) RETURNS TABLE(tenant_id uuid, id uuid)
    LANGUAGE sql SECURITY DEFINER
    SET search_path TO 'pg_catalog'
    AS $$
 select e.tenant_id,e.id from shared.bundle_exports e
 where (e.expires_at<=now() and e.status not in ('expired','cancelled')) or (e.status in ('queued','retrying') and e.next_run_at<=now()) or (e.status='running' and e.lease_until<=now())
 order by e.next_run_at,e.id limit greatest(1,least(p_limit,100))
$$;


--
-- Name: pending_imports(integer); Type: FUNCTION; Schema: shared; Owner: -
--

CREATE FUNCTION shared.pending_imports(batch_limit integer) RETURNS TABLE(tenant_id uuid, id uuid)
    LANGUAGE sql SECURITY DEFINER
    SET search_path TO 'pg_catalog'
    AS $$
 select tenant_id,id from shared.jobs where type='import' and
 (status in ('queued','running') or (status='retrying' and next_run_at<=now()))
 order by case when status='running' then 1 else 0 end,coalesce(next_run_at,created_at),id limit least(batch_limit,100)
$$;


--
-- Name: pin_delivery_source(uuid, bigint, uuid, text); Type: FUNCTION; Schema: shared; Owner: -
--

CREATE FUNCTION shared.pin_delivery_source(site uuid, version bigint, lease uuid, key text) RETURNS boolean
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'pg_catalog'
    AS $$
begin
 perform 1 from shared.delivery_publications where site_id=site and epoch=version and token=lease and lease_until>now() for share;
 if not found then return false;end if;
 perform pg_advisory_xact_lock(hashtextextended('source-object:'||key,0));
 insert into shared.delivery_source_pins values(lease,key,now()+interval '5 minutes') on conflict(token,storage_key) do update set protected_until=excluded.protected_until;
 return true;
end $$;


--
-- Name: audit_log; Type: TABLE; Schema: shared; Owner: -
--

CREATE TABLE shared.audit_log (
    credential_id uuid,
    id bigint NOT NULL,
    occurred_at timestamp with time zone DEFAULT now() NOT NULL,
    tenant_id uuid,
    actor_type text NOT NULL,
    actor_id uuid,
    action text NOT NULL,
    target_type text,
    target_id uuid,
    outcome text NOT NULL,
    change_summary jsonb,
    ip inet,
    request_id text,
    event_id uuid DEFAULT uuidv7() NOT NULL,
    root_id uuid DEFAULT uuidv7() NOT NULL,
    kind text DEFAULT 'fact'::text NOT NULL,
    CONSTRAINT audit_log_actor_type_check CHECK ((actor_type = ANY (ARRAY['user'::text, 'token'::text, 'system'::text, 'anonymous'::text]))),
    CONSTRAINT audit_log_kind_check CHECK ((kind = ANY (ARRAY['fact'::text, 'attempt'::text])))
);

ALTER TABLE ONLY shared.audit_log FORCE ROW LEVEL SECURITY;


--
-- Name: TABLE audit_log; Type: COMMENT; Schema: shared; Owner: -
--

COMMENT ON TABLE shared.audit_log IS 'rls:tenant/direct-nullable; NULL 仅供平台审计';


--
-- Name: platform_audit(); Type: FUNCTION; Schema: shared; Owner: -
--

CREATE FUNCTION shared.platform_audit() RETURNS SETOF shared.audit_log
    LANGUAGE sql SECURITY DEFINER
    SET search_path TO 'pg_catalog'
    AS $$
 select * from shared.audit_log where tenant_id is null
$$;


--
-- Name: record_delivery_outcome(); Type: FUNCTION; Schema: shared; Owner: -
--

CREATE FUNCTION shared.record_delivery_outcome() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'pg_catalog'
    AS $$
begin
 if new.status in ('completed','failed') and (old.status is distinct from new.status or old.epoch is distinct from new.epoch) then
  insert into shared.delivery_events(tenant_id,site_id,epoch,status) values(new.tenant_id,new.site_id,new.epoch,new.status) on conflict do nothing;
 end if;
 return new;
end $$;


--
-- Name: release_delivery_source(uuid, text); Type: FUNCTION; Schema: shared; Owner: -
--

CREATE FUNCTION shared.release_delivery_source(lease uuid, key text) RETURNS void
    LANGUAGE sql SECURITY DEFINER
    SET search_path TO 'pg_catalog'
    AS $$
 delete from shared.delivery_source_pins where token=lease and storage_key=key
$$;


--
-- Name: renew_audit_export(uuid, uuid); Type: FUNCTION; Schema: shared; Owner: -
--

CREATE FUNCTION shared.renew_audit_export(target uuid, token uuid) RETURNS boolean
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'pg_catalog'
    AS $$
begin update shared.audit_exports set lease_until=now()+interval '90 seconds' where id=target and lease_token=token and status='running';return found;end $$;


--
-- Name: renew_delivery_publication(uuid, bigint, uuid); Type: FUNCTION; Schema: shared; Owner: -
--

CREATE FUNCTION shared.renew_delivery_publication(p_site uuid, p_epoch bigint, p_token uuid) RETURNS boolean
    LANGUAGE sql SECURITY DEFINER
    SET search_path TO 'pg_catalog'
    AS $$
 with renewed as (update shared.delivery_publications set lease_until=now()+interval '2 minutes'
 where site_id=p_site and epoch=p_epoch and token=p_token and status='running' and lease_until>now() returning 1)
 select exists(select 1 from renewed)
$$;


--
-- Name: require_tenant_id(); Type: FUNCTION; Schema: shared; Owner: -
--

CREATE FUNCTION shared.require_tenant_id() RETURNS uuid
    LANGUAGE plpgsql STABLE
    SET search_path TO 'pg_catalog'
    AS $$
declare
  raw_tenant_id text;
begin
  raw_tenant_id := nullif(btrim(current_setting('app.tenant_id', true)), '');
  if raw_tenant_id is null then
    raise exception using
      errcode = '42501',
      message = 'tenant context is required';
  end if;

  begin
    return raw_tenant_id::uuid;
  exception
    when invalid_text_representation then
      raise exception using
        errcode = '42501',
        message = 'tenant context is invalid';
  end;
end
$$;


--
-- Name: FUNCTION require_tenant_id(); Type: COMMENT; Schema: shared; Owner: -
--

COMMENT ON FUNCTION shared.require_tenant_id() IS '读取并校验事务级 app.tenant_id；RLS policy 缺失或非法时以 SQLSTATE 42501 拒绝';


--
-- Name: resource_belongs_to_current_tenant(text, uuid); Type: FUNCTION; Schema: shared; Owner: -
--

CREATE FUNCTION shared.resource_belongs_to_current_tenant(requested_resource_type text, requested_resource_id uuid) RETURNS boolean
    LANGUAGE sql STABLE
    SET search_path TO 'pg_catalog'
    AS $$
  select case requested_resource_type
    when 'tenant' then requested_resource_id = shared.require_tenant_id()
    when 'team' then exists (
      select 1 from iam.teams team
       where team.id = requested_resource_id
         and team.tenant_id = shared.require_tenant_id())
    when 'site' then exists (
      select 1 from hosting.sites site
       where site.id = requested_resource_id
         and site.tenant_id = shared.require_tenant_id())
    when 'space' then exists (
      select 1 from authoring.spaces space
       where space.id = requested_resource_id
         and space.tenant_id = shared.require_tenant_id())
    when 'page' then exists (
      select 1 from authoring.pages page
       where page.id = requested_resource_id
         and page.tenant_id = shared.require_tenant_id())
    else false
  end
$$;


--
-- Name: FUNCTION resource_belongs_to_current_tenant(requested_resource_type text, requested_resource_id uuid); Type: COMMENT; Schema: shared; Owner: -
--

COMMENT ON FUNCTION shared.resource_belongs_to_current_tenant(requested_resource_type text, requested_resource_id uuid) IS 'RLS write integrity: Tenant/Team/Site/Space/Page belongs to current app.tenant_id';


--
-- Name: retain_audit(timestamp with time zone); Type: FUNCTION; Schema: shared; Owner: -
--

CREATE FUNCTION shared.retain_audit(cutoff timestamp with time zone) RETURNS void
    LANGUAGE sql SECURITY DEFINER
    SET search_path TO 'pg_catalog'
    AS $$
 delete from shared.audit_log where occurred_at<cutoff
$$;


--
-- Name: runtime_provision_tenant(text); Type: FUNCTION; Schema: shared; Owner: -
--

CREATE FUNCTION shared.runtime_provision_tenant(p_name text) RETURNS TABLE(id uuid, name text, status text, created_at timestamp with time zone)
    LANGUAGE sql SECURITY DEFINER
    SET search_path TO 'pg_catalog'
    AS $$
  insert into shared.tenants (name) values (p_name)
  returning id, name, status, created_at
$$;


--
-- Name: runtime_set_tenant_status(uuid, text); Type: FUNCTION; Schema: shared; Owner: -
--

CREATE FUNCTION shared.runtime_set_tenant_status(p_id uuid, p_status text) RETURNS void
    LANGUAGE sql SECURITY DEFINER
    SET search_path TO 'pg_catalog'
    AS $$ update shared.tenants set status = p_status, updated_at = now() where id = p_id $$;


--
-- Name: runtime_tenant(uuid); Type: FUNCTION; Schema: shared; Owner: -
--

CREATE FUNCTION shared.runtime_tenant(p_id uuid) RETURNS TABLE(id uuid, name text, status text, created_at timestamp with time zone)
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'pg_catalog'
    AS $$ select id, name, status, created_at from shared.tenants where id = p_id $$;


--
-- Name: runtime_tenant_page(timestamp with time zone, uuid, integer); Type: FUNCTION; Schema: shared; Owner: -
--

CREATE FUNCTION shared.runtime_tenant_page(p_before_created_at timestamp with time zone, p_before_id uuid, p_limit integer) RETURNS TABLE(id uuid, name text, status text, created_at timestamp with time zone)
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'pg_catalog'
    AS $$
  select id, name, status, created_at from shared.tenants
   where p_before_created_at is null or (created_at, id) < (p_before_created_at, p_before_id)
   order by created_at desc, id desc limit p_limit
$$;


--
-- Name: runtime_tenants(uuid[]); Type: FUNCTION; Schema: shared; Owner: -
--

CREATE FUNCTION shared.runtime_tenants(p_ids uuid[]) RETURNS TABLE(id uuid, name text, status text, created_at timestamp with time zone)
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'pg_catalog'
    AS $$
  select id, name, status, created_at from shared.tenants
   where id = any(p_ids) order by created_at desc, id desc
$$;


--
-- Name: scrub_audit_actor(uuid); Type: FUNCTION; Schema: shared; Owner: -
--

CREATE FUNCTION shared.scrub_audit_actor(actor uuid) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'pg_catalog'
    AS $$
begin
 perform pg_advisory_xact_lock(hashtextextended('audit-actor:'||actor::text,0));
 insert into shared.audit_redacted_actors values(actor) on conflict do nothing;
 update shared.audit_log set ip=null,change_summary=null where actor_id=actor;
 update shared.audit_exports set status='failed',error='audit_changed',object_key=null,lease_token=null where expires_at>now();
end $$;


--
-- Name: touch_updated_at(); Type: FUNCTION; Schema: shared; Owner: -
--

CREATE FUNCTION shared.touch_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
begin new.updated_at = now(); return new; end $$;


--
-- Name: analytics_activity; Type: TABLE; Schema: shared; Owner: -
--

CREATE TABLE shared.analytics_activity (
    id uuid DEFAULT uuidv7() NOT NULL,
    tenant_id uuid NOT NULL,
    space_id uuid NOT NULL,
    page_id uuid,
    actor_id uuid,
    kind text NOT NULL,
    occurred_at timestamp with time zone NOT NULL
);

ALTER TABLE ONLY shared.analytics_activity FORCE ROW LEVEL SECURITY;


--
-- Name: TABLE analytics_activity; Type: COMMENT; Schema: shared; Owner: -
--

COMMENT ON TABLE shared.analytics_activity IS 'rls:tenant/direct; action event projection for usage and author activity';


--
-- Name: analytics_events; Type: TABLE; Schema: shared; Owner: -
--

CREATE TABLE shared.analytics_events (
    id uuid NOT NULL,
    source_id uuid NOT NULL,
    occurred_at timestamp with time zone NOT NULL,
    tenant_id uuid NOT NULL,
    site_id uuid NOT NULL,
    page_id uuid,
    type text NOT NULL,
    path text,
    query text,
    search_id uuid,
    visitor text,
    referrer text,
    zero boolean DEFAULT false NOT NULL,
    CONSTRAINT analytics_events_type_check CHECK ((type = ANY (ARRAY['pv'::text, 'notfound'::text, 'redirect'::text, 'search'::text, 'click'::text, 'observable'::text])))
);

ALTER TABLE ONLY shared.analytics_events FORCE ROW LEVEL SECURITY;


--
-- Name: TABLE analytics_events; Type: COMMENT; Schema: shared; Owner: -
--

COMMENT ON TABLE shared.analytics_events IS 'rls:tenant/direct; deduplicated telemetry with no raw IP';


--
-- Name: analytics_sources; Type: TABLE; Schema: shared; Owner: -
--

CREATE TABLE shared.analytics_sources (
    id uuid NOT NULL,
    last_seen timestamp with time zone NOT NULL,
    dropped bigint DEFAULT 0 NOT NULL,
    collector boolean DEFAULT false NOT NULL
);


--
-- Name: TABLE analytics_sources; Type: COMMENT; Schema: shared; Owner: -
--

COMMENT ON TABLE shared.analytics_sources IS 'rls:infrastructure/collector-health; source heartbeats and loss counters';


--
-- Name: service_heartbeats; Type: TABLE; Schema: shared; Owner: -
--

CREATE TABLE shared.service_heartbeats (
    service text NOT NULL,
    instance text NOT NULL,
    version text,
    seen_at timestamp with time zone DEFAULT now() NOT NULL,
    details jsonb DEFAULT '{}'::jsonb NOT NULL,
    CONSTRAINT service_heartbeats_service_check CHECK ((service = ANY (ARRAY['space-management'::text, 'space-worker'::text])))
);


--
-- Name: TABLE service_heartbeats; Type: COMMENT; Schema: shared; Owner: -
--

COMMENT ON TABLE shared.service_heartbeats IS 'rls:infrastructure/service-health; per-process heartbeats read by the platform 服务状态 page; no tenant data';


--
-- Name: record_service_heartbeat(text, text, text, jsonb); Type: FUNCTION; Schema: shared; Owner: -
--

CREATE FUNCTION shared.record_service_heartbeat(p_service text, p_instance text, p_version text, p_details jsonb) RETURNS void
    LANGUAGE sql SECURITY DEFINER
    SET search_path TO 'pg_catalog'
    AS $$
 insert into shared.service_heartbeats(service,instance,version,seen_at,details)
 values(p_service,p_instance,p_version,now(),coalesce(p_details,'{}'::jsonb))
 on conflict(service,instance) do update
 set version=excluded.version,seen_at=excluded.seen_at,details=excluded.details
$$;


--
-- Name: audit_log_id_seq; Type: SEQUENCE; Schema: shared; Owner: -
--

ALTER TABLE shared.audit_log ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME shared.audit_log_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: audit_redacted_actors; Type: TABLE; Schema: shared; Owner: -
--

CREATE TABLE shared.audit_redacted_actors (
    actor_id uuid NOT NULL
);


--
-- Name: TABLE audit_redacted_actors; Type: COMMENT; Schema: shared; Owner: -
--

COMMENT ON TABLE shared.audit_redacted_actors IS 'rls:infrastructure/audit-redaction; stable actor tombstones without PII';


--
-- Name: bundle_exports; Type: TABLE; Schema: shared; Owner: -
--

CREATE TABLE shared.bundle_exports (
    id uuid NOT NULL,
    tenant_id uuid NOT NULL,
    space_id uuid NOT NULL,
    release_id uuid NOT NULL,
    status text DEFAULT 'queued'::text NOT NULL,
    snapshot jsonb,
    page_ids uuid[] DEFAULT '{}'::uuid[] NOT NULL,
    object_keys text[] DEFAULT '{}'::text[] NOT NULL,
    output_key text,
    output_bytes bigint,
    token uuid,
    lease_until timestamp with time zone,
    attempts integer DEFAULT 0 NOT NULL,
    next_run_at timestamp with time zone DEFAULT now() NOT NULL,
    error text,
    trace_id text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    expires_at timestamp with time zone NOT NULL,
    CONSTRAINT bundle_exports_status_check CHECK ((status = ANY (ARRAY['queued'::text, 'running'::text, 'retrying'::text, 'failed'::text, 'completed'::text, 'expired'::text, 'cancelled'::text])))
);

ALTER TABLE ONLY shared.bundle_exports FORCE ROW LEVEL SECURITY;


--
-- Name: TABLE bundle_exports; Type: COMMENT; Schema: shared; Owner: -
--

COMMENT ON TABLE shared.bundle_exports IS 'rls:tenant/direct-context-stamp; fixed authorized Bundle export intent and private artifact metadata';


--
-- Name: deletion_records; Type: TABLE; Schema: shared; Owner: -
--

CREATE TABLE shared.deletion_records (
    id uuid DEFAULT uuidv7() NOT NULL,
    tenant_id uuid NOT NULL,
    resource_type text NOT NULL,
    resource_id uuid NOT NULL,
    actor_id uuid,
    status text DEFAULT 'queued'::text NOT NULL,
    objects jsonb DEFAULT '[]'::jsonb NOT NULL,
    sites jsonb DEFAULT '[]'::jsonb NOT NULL,
    error text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT deletion_records_resource_type_check CHECK ((resource_type = ANY (ARRAY['space'::text, 'site'::text, 'page'::text]))),
    CONSTRAINT deletion_records_status_check CHECK ((status = ANY (ARRAY['queued'::text, 'running'::text, 'retrying'::text, 'failed'::text, 'completed'::text])))
);

ALTER TABLE ONLY shared.deletion_records FORCE ROW LEVEL SECURITY;


--
-- Name: TABLE deletion_records; Type: COMMENT; Schema: shared; Owner: -
--

COMMENT ON TABLE shared.deletion_records IS 'rls:tenant/direct; recoverable cleanup after resource termination';


--
-- Name: delivery_epoch; Type: SEQUENCE; Schema: shared; Owner: -
--

CREATE SEQUENCE shared.delivery_epoch
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: delivery_events; Type: TABLE; Schema: shared; Owner: -
--

CREATE TABLE shared.delivery_events (
    id uuid DEFAULT uuidv7() NOT NULL,
    tenant_id uuid NOT NULL,
    site_id uuid NOT NULL,
    epoch bigint NOT NULL,
    status text NOT NULL,
    occurred_at timestamp with time zone DEFAULT now() NOT NULL,
    dispatched boolean DEFAULT false NOT NULL
);

ALTER TABLE ONLY shared.delivery_events FORCE ROW LEVEL SECURITY;


--
-- Name: TABLE delivery_events; Type: COMMENT; Schema: shared; Owner: -
--

COMMENT ON TABLE shared.delivery_events IS 'rls:tenant/direct; durable delivery outcomes for webhook fanout';


--
-- Name: delivery_source_pins; Type: TABLE; Schema: shared; Owner: -
--

CREATE TABLE shared.delivery_source_pins (
    token uuid NOT NULL,
    storage_key text NOT NULL,
    protected_until timestamp with time zone NOT NULL
);


--
-- Name: TABLE delivery_source_pins; Type: COMMENT; Schema: shared; Owner: -
--

COMMENT ON TABLE shared.delivery_source_pins IS 'rls:infrastructure/copy-pins; opaque source objects protected while copied';


--
-- Name: dns_txt_stubs; Type: TABLE; Schema: shared; Owner: -
--

CREATE TABLE shared.dns_txt_stubs (
    name text NOT NULL,
    value text NOT NULL
);


--
-- Name: TABLE dns_txt_stubs; Type: COMMENT; Schema: shared; Owner: -
--

COMMENT ON TABLE shared.dns_txt_stubs IS 'rls:infrastructure/dns-stubs; fake TXT for local/e2e; E2E inserts as owner, space_app SELECT only';


--
-- Name: event_publication; Type: TABLE; Schema: shared; Owner: -
--

CREATE TABLE shared.event_publication (
    id uuid NOT NULL,
    listener_id text NOT NULL,
    event_type text NOT NULL,
    serialized_event text NOT NULL,
    publication_date timestamp with time zone NOT NULL,
    completion_date timestamp with time zone,
    status text,
    completion_attempts integer,
    last_resubmission_date timestamp with time zone
);


--
-- Name: TABLE event_publication; Type: COMMENT; Schema: shared; Owner: -
--

COMMENT ON TABLE shared.event_publication IS 'rls:infrastructure/Spring Modulith durable event registry';


--
-- Name: event_publication_archive; Type: TABLE; Schema: shared; Owner: -
--

CREATE TABLE shared.event_publication_archive (
    id uuid NOT NULL,
    listener_id text NOT NULL,
    event_type text NOT NULL,
    serialized_event text NOT NULL,
    publication_date timestamp with time zone NOT NULL,
    completion_date timestamp with time zone,
    status text,
    completion_attempts integer,
    last_resubmission_date timestamp with time zone
);


--
-- Name: TABLE event_publication_archive; Type: COMMENT; Schema: shared; Owner: -
--

COMMENT ON TABLE shared.event_publication_archive IS 'rls:infrastructure/Spring Modulith completed event archive';


--
-- Name: idempotency_records; Type: TABLE; Schema: shared; Owner: -
--

CREATE TABLE shared.idempotency_records (
    principal_type text NOT NULL,
    principal_id uuid NOT NULL,
    operation text NOT NULL,
    idempotency_key text NOT NULL,
    request_fingerprint text NOT NULL,
    state text NOT NULL,
    response_status integer,
    response_body text,
    response_content_type text,
    created_at timestamp with time zone NOT NULL,
    expires_at timestamp with time zone NOT NULL,
    CONSTRAINT idempotency_records_check CHECK ((((state = 'processing'::text) AND (response_status IS NULL) AND (response_body IS NULL) AND (response_content_type IS NULL)) OR ((state = 'completed'::text) AND (response_status IS NOT NULL) AND (response_body IS NOT NULL) AND (response_content_type IS NOT NULL)))),
    CONSTRAINT idempotency_records_idempotency_key_check CHECK (((length(idempotency_key) >= 1) AND (length(idempotency_key) <= 255))),
    CONSTRAINT idempotency_records_state_check CHECK ((state = ANY (ARRAY['processing'::text, 'completed'::text])))
);


--
-- Name: TABLE idempotency_records; Type: COMMENT; Schema: shared; Owner: -
--

COMMENT ON TABLE shared.idempotency_records IS 'rls:infrastructure/ADR-0016 幂等执行记录；业务动作与 completed 结果必须在同一事务提交，TTL 固定 24h';


--
-- Name: COLUMN idempotency_records.response_body; Type: COMMENT; Schema: shared; Owner: -
--

COMMENT ON COLUMN shared.idempotency_records.response_body IS 'AES-256-GCM 版本化加密 envelope（v1:base64(nonce+ciphertext+tag)），禁止保存明文响应';


--
-- Name: jobs; Type: TABLE; Schema: shared; Owner: -
--

CREATE TABLE shared.jobs (
    id uuid DEFAULT uuidv7() NOT NULL,
    tenant_id uuid NOT NULL,
    type text NOT NULL,
    space_id uuid,
    status text DEFAULT 'queued'::text NOT NULL,
    payload jsonb,
    error text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    started_at timestamp with time zone,
    finished_at timestamp with time zone,
    phase text,
    progress_done integer,
    progress_total integer,
    attempt integer DEFAULT 0 NOT NULL,
    next_run_at timestamp with time zone,
    outcome text,
    release_id uuid,
    zip_sha256 text,
    zip_key text,
    adapter_id text,
    last_error_code text,
    CONSTRAINT jobs_status_check CHECK ((status = ANY (ARRAY['queued'::text, 'running'::text, 'retrying'::text, 'held'::text, 'failed'::text, 'completed'::text])))
);

ALTER TABLE ONLY shared.jobs FORCE ROW LEVEL SECURITY;


--
-- Name: TABLE jobs; Type: COMMENT; Schema: shared; Owner: -
--

COMMENT ON TABLE shared.jobs IS 'rls:tenant/direct; 后台作业需窄 claim 入口';


--
-- Name: mail_outbox; Type: TABLE; Schema: shared; Owner: -
--

CREATE TABLE shared.mail_outbox (
    id uuid NOT NULL,
    kind text NOT NULL,
    recipient text NOT NULL,
    encrypted_payload text NOT NULL,
    state text DEFAULT 'queued'::text NOT NULL,
    attempts integer DEFAULT 0 NOT NULL,
    next_run_at timestamp with time zone DEFAULT now() NOT NULL,
    last_error_code text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    completed_at timestamp with time zone,
    lease_token uuid,
    lease_until timestamp with time zone,
    tenant_id uuid,
    trace_id uuid,
    outcome text,
    cycle_attempts integer DEFAULT 0 NOT NULL,
    CONSTRAINT mail_outbox_attempts_check CHECK ((attempts >= 0)),
    CONSTRAINT mail_outbox_kind_check CHECK ((kind = ANY (ARRAY['verification'::text, 'invitation'::text, 'password_reset'::text]))),
    CONSTRAINT mail_outbox_state_check CHECK ((state = ANY (ARRAY['queued'::text, 'running'::text, 'retrying'::text, 'failed'::text, 'completed'::text])))
);


--
-- Name: TABLE mail_outbox; Type: COMMENT; Schema: shared; Owner: -
--

COMMENT ON TABLE shared.mail_outbox IS 'rls:infrastructure/encrypted post-commit mail intent; plaintext credentials never stored';


--
-- Name: object_inventory_cursor; Type: TABLE; Schema: shared; Owner: -
--

CREATE TABLE shared.object_inventory_cursor (
    singleton boolean NOT NULL,
    after_key text,
    scan_objects bigint DEFAULT 0 NOT NULL,
    scan_bytes bigint DEFAULT 0 NOT NULL,
    total_objects bigint,
    total_bytes bigint,
    completed_at timestamp with time zone,
    CONSTRAINT object_inventory_cursor_singleton_check CHECK (singleton)
);


--
-- Name: TABLE object_inventory_cursor; Type: COMMENT; Schema: shared; Owner: -
--

COMMENT ON TABLE shared.object_inventory_cursor IS 'rls:infrastructure/inventory-progress; durable source bucket scan position';


--
-- Name: source_objects; Type: TABLE; Schema: shared; Owner: -
--

CREATE TABLE shared.source_objects (
    storage_key text NOT NULL,
    protected_until timestamp with time zone NOT NULL,
    attempts integer DEFAULT 0 NOT NULL,
    next_retry_at timestamp with time zone DEFAULT now() NOT NULL,
    last_error text
);


--
-- Name: TABLE source_objects; Type: COMMENT; Schema: shared; Owner: -
--

COMMENT ON TABLE shared.source_objects IS 'rls:infrastructure/source-object-leases; opaque content-addressed keys, no tenant data';


--
-- Name: tenants; Type: TABLE; Schema: shared; Owner: -
--

CREATE TABLE shared.tenants (
    id uuid DEFAULT uuidv7() NOT NULL,
    name text NOT NULL,
    status text DEFAULT 'active'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT tenants_status_check CHECK ((status = ANY (ARRAY['active'::text, 'suspended'::text])))
);

ALTER TABLE ONLY shared.tenants FORCE ROW LEVEL SECURITY;


--
-- Name: TABLE tenants; Type: COMMENT; Schema: shared; Owner: -
--

COMMENT ON TABLE shared.tenants IS 'rls:tenant/direct-id; Tenant 根行';


--
-- Name: webhook_attempts; Type: TABLE; Schema: shared; Owner: -
--

CREATE TABLE shared.webhook_attempts (
    id uuid NOT NULL,
    delivery_id uuid NOT NULL,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    response_code integer,
    error text,
    duration_ms bigint
);

ALTER TABLE ONLY shared.webhook_attempts FORCE ROW LEVEL SECURITY;


--
-- Name: TABLE webhook_attempts; Type: COMMENT; Schema: shared; Owner: -
--

COMMENT ON TABLE shared.webhook_attempts IS 'rls:tenant/via-delivery; delivery attempt metadata without secret or response body';


--
-- Name: webhook_deliveries; Type: TABLE; Schema: shared; Owner: -
--

CREATE TABLE shared.webhook_deliveries (
    id uuid DEFAULT uuidv7() NOT NULL,
    webhook_id uuid NOT NULL,
    event_type text NOT NULL,
    payload jsonb NOT NULL,
    status text DEFAULT 'queued'::text NOT NULL,
    attempts integer DEFAULT 0 NOT NULL,
    next_retry_at timestamp with time zone,
    response_code integer,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    event_id uuid DEFAULT uuidv7() NOT NULL,
    lease_token uuid,
    lease_until timestamp with time zone,
    auto_attempts integer DEFAULT 0 NOT NULL,
    CONSTRAINT webhook_deliveries_status_check CHECK ((status = ANY (ARRAY['queued'::text, 'running'::text, 'retrying'::text, 'failed'::text, 'completed'::text])))
);

ALTER TABLE ONLY shared.webhook_deliveries FORCE ROW LEVEL SECURITY;


--
-- Name: TABLE webhook_deliveries; Type: COMMENT; Schema: shared; Owner: -
--

COMMENT ON TABLE shared.webhook_deliveries IS 'rls:tenant/via-webhook; 投递归属 Webhook';


--
-- Name: webhooks; Type: TABLE; Schema: shared; Owner: -
--

CREATE TABLE shared.webhooks (
    id uuid DEFAULT uuidv7() NOT NULL,
    tenant_id uuid NOT NULL,
    url text NOT NULL,
    secret text NOT NULL,
    events text[] NOT NULL,
    active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    scope_type text DEFAULT 'tenant'::text NOT NULL,
    scope_id uuid,
    CONSTRAINT webhooks_scope_type_check CHECK ((scope_type = ANY (ARRAY['tenant'::text, 'space'::text, 'site'::text])))
);

ALTER TABLE ONLY shared.webhooks FORCE ROW LEVEL SECURITY;


--
-- Name: TABLE webhooks; Type: COMMENT; Schema: shared; Owner: -
--

COMMENT ON TABLE shared.webhooks IS 'rls:tenant/direct; Webhook 配置';


--
-- Name: analytics_activity analytics_activity_pkey; Type: CONSTRAINT; Schema: shared; Owner: -
--

ALTER TABLE ONLY shared.analytics_activity
    ADD CONSTRAINT analytics_activity_pkey PRIMARY KEY (id);


--
-- Name: analytics_events analytics_events_pkey; Type: CONSTRAINT; Schema: shared; Owner: -
--

ALTER TABLE ONLY shared.analytics_events
    ADD CONSTRAINT analytics_events_pkey PRIMARY KEY (id);


--
-- Name: analytics_sources analytics_sources_pkey; Type: CONSTRAINT; Schema: shared; Owner: -
--

ALTER TABLE ONLY shared.analytics_sources
    ADD CONSTRAINT analytics_sources_pkey PRIMARY KEY (id);


--
-- Name: service_heartbeats service_heartbeats_pkey; Type: CONSTRAINT; Schema: shared; Owner: -
--

ALTER TABLE ONLY shared.service_heartbeats
    ADD CONSTRAINT service_heartbeats_pkey PRIMARY KEY (service, instance);


--
-- Name: audit_exports audit_exports_pkey; Type: CONSTRAINT; Schema: shared; Owner: -
--

ALTER TABLE ONLY shared.audit_exports
    ADD CONSTRAINT audit_exports_pkey PRIMARY KEY (id);


--
-- Name: audit_log audit_log_pkey; Type: CONSTRAINT; Schema: shared; Owner: -
--

ALTER TABLE ONLY shared.audit_log
    ADD CONSTRAINT audit_log_pkey PRIMARY KEY (id);


--
-- Name: audit_redacted_actors audit_redacted_actors_pkey; Type: CONSTRAINT; Schema: shared; Owner: -
--

ALTER TABLE ONLY shared.audit_redacted_actors
    ADD CONSTRAINT audit_redacted_actors_pkey PRIMARY KEY (actor_id);


--
-- Name: bundle_exports bundle_exports_pkey; Type: CONSTRAINT; Schema: shared; Owner: -
--

ALTER TABLE ONLY shared.bundle_exports
    ADD CONSTRAINT bundle_exports_pkey PRIMARY KEY (id);


--
-- Name: deletion_records deletion_records_pkey; Type: CONSTRAINT; Schema: shared; Owner: -
--

ALTER TABLE ONLY shared.deletion_records
    ADD CONSTRAINT deletion_records_pkey PRIMARY KEY (id);


--
-- Name: deletion_records deletion_records_resource_id_key; Type: CONSTRAINT; Schema: shared; Owner: -
--

ALTER TABLE ONLY shared.deletion_records
    ADD CONSTRAINT deletion_records_resource_id_key UNIQUE (resource_id);


--
-- Name: delivery_events delivery_events_pkey; Type: CONSTRAINT; Schema: shared; Owner: -
--

ALTER TABLE ONLY shared.delivery_events
    ADD CONSTRAINT delivery_events_pkey PRIMARY KEY (id);


--
-- Name: delivery_events delivery_events_site_id_epoch_status_key; Type: CONSTRAINT; Schema: shared; Owner: -
--

ALTER TABLE ONLY shared.delivery_events
    ADD CONSTRAINT delivery_events_site_id_epoch_status_key UNIQUE (site_id, epoch, status);


--
-- Name: delivery_publications delivery_publications_pkey; Type: CONSTRAINT; Schema: shared; Owner: -
--

ALTER TABLE ONLY shared.delivery_publications
    ADD CONSTRAINT delivery_publications_pkey PRIMARY KEY (site_id);


--
-- Name: delivery_source_pins delivery_source_pins_pkey; Type: CONSTRAINT; Schema: shared; Owner: -
--

ALTER TABLE ONLY shared.delivery_source_pins
    ADD CONSTRAINT delivery_source_pins_pkey PRIMARY KEY (token, storage_key);


--
-- Name: dns_txt_stubs dns_txt_stubs_pkey; Type: CONSTRAINT; Schema: shared; Owner: -
--

ALTER TABLE ONLY shared.dns_txt_stubs
    ADD CONSTRAINT dns_txt_stubs_pkey PRIMARY KEY (name, value);


--
-- Name: event_publication_archive event_publication_archive_pkey; Type: CONSTRAINT; Schema: shared; Owner: -
--

ALTER TABLE ONLY shared.event_publication_archive
    ADD CONSTRAINT event_publication_archive_pkey PRIMARY KEY (id);


--
-- Name: event_publication event_publication_pkey; Type: CONSTRAINT; Schema: shared; Owner: -
--

ALTER TABLE ONLY shared.event_publication
    ADD CONSTRAINT event_publication_pkey PRIMARY KEY (id);


--
-- Name: idempotency_records idempotency_records_pkey; Type: CONSTRAINT; Schema: shared; Owner: -
--

ALTER TABLE ONLY shared.idempotency_records
    ADD CONSTRAINT idempotency_records_pkey PRIMARY KEY (principal_type, principal_id, operation, idempotency_key);


--
-- Name: jobs jobs_pkey; Type: CONSTRAINT; Schema: shared; Owner: -
--

ALTER TABLE ONLY shared.jobs
    ADD CONSTRAINT jobs_pkey PRIMARY KEY (id);


--
-- Name: mail_outbox mail_outbox_pkey; Type: CONSTRAINT; Schema: shared; Owner: -
--

ALTER TABLE ONLY shared.mail_outbox
    ADD CONSTRAINT mail_outbox_pkey PRIMARY KEY (id);


--
-- Name: object_inventory_cursor object_inventory_cursor_pkey; Type: CONSTRAINT; Schema: shared; Owner: -
--

ALTER TABLE ONLY shared.object_inventory_cursor
    ADD CONSTRAINT object_inventory_cursor_pkey PRIMARY KEY (singleton);


--
-- Name: reader_security_publications reader_security_publications_pkey; Type: CONSTRAINT; Schema: shared; Owner: -
--

ALTER TABLE ONLY shared.reader_security_publications
    ADD CONSTRAINT reader_security_publications_pkey PRIMARY KEY (kind, scope_id);


--
-- Name: source_objects source_objects_pkey; Type: CONSTRAINT; Schema: shared; Owner: -
--

ALTER TABLE ONLY shared.source_objects
    ADD CONSTRAINT source_objects_pkey PRIMARY KEY (storage_key);


--
-- Name: tenants tenants_pkey; Type: CONSTRAINT; Schema: shared; Owner: -
--

ALTER TABLE ONLY shared.tenants
    ADD CONSTRAINT tenants_pkey PRIMARY KEY (id);


--
-- Name: webhook_attempts webhook_attempts_pkey; Type: CONSTRAINT; Schema: shared; Owner: -
--

ALTER TABLE ONLY shared.webhook_attempts
    ADD CONSTRAINT webhook_attempts_pkey PRIMARY KEY (id);


--
-- Name: webhook_deliveries webhook_deliveries_pkey; Type: CONSTRAINT; Schema: shared; Owner: -
--

ALTER TABLE ONLY shared.webhook_deliveries
    ADD CONSTRAINT webhook_deliveries_pkey PRIMARY KEY (id);


--
-- Name: webhooks webhooks_pkey; Type: CONSTRAINT; Schema: shared; Owner: -
--

ALTER TABLE ONLY shared.webhooks
    ADD CONSTRAINT webhooks_pkey PRIMARY KEY (id);


--
-- Name: analytics_activity_tenant_id_space_id_occurred_at_idx; Type: INDEX; Schema: shared; Owner: -
--

CREATE INDEX analytics_activity_tenant_id_space_id_occurred_at_idx ON shared.analytics_activity USING btree (tenant_id, space_id, occurred_at);


--
-- Name: analytics_events_site_id_search_id_type_idx; Type: INDEX; Schema: shared; Owner: -
--

CREATE INDEX analytics_events_site_id_search_id_type_idx ON shared.analytics_events USING btree (site_id, search_id, type);


--
-- Name: analytics_events_tenant_id_site_id_occurred_at_idx; Type: INDEX; Schema: shared; Owner: -
--

CREATE INDEX analytics_events_tenant_id_site_id_occurred_at_idx ON shared.analytics_events USING btree (tenant_id, site_id, occurred_at);


--
-- Name: audit_log_event_id_idx; Type: INDEX; Schema: shared; Owner: -
--

CREATE UNIQUE INDEX audit_log_event_id_idx ON shared.audit_log USING btree (event_id);


--
-- Name: audit_log_target_type_target_id_occurred_at_idx; Type: INDEX; Schema: shared; Owner: -
--

CREATE INDEX audit_log_target_type_target_id_occurred_at_idx ON shared.audit_log USING btree (target_type, target_id, occurred_at DESC);


--
-- Name: audit_log_tenant_id_actor_id_id_idx; Type: INDEX; Schema: shared; Owner: -
--

CREATE INDEX audit_log_tenant_id_actor_id_id_idx ON shared.audit_log USING btree (tenant_id, actor_id, id DESC);


--
-- Name: audit_log_tenant_id_occurred_at_idx; Type: INDEX; Schema: shared; Owner: -
--

CREATE INDEX audit_log_tenant_id_occurred_at_idx ON shared.audit_log USING btree (tenant_id, occurred_at DESC);


--
-- Name: bundle_exports_due; Type: INDEX; Schema: shared; Owner: -
--

CREATE INDEX bundle_exports_due ON shared.bundle_exports USING btree (next_run_at, id) WHERE (status = ANY (ARRAY['queued'::text, 'retrying'::text, 'running'::text]));


--
-- Name: bundle_exports_objects; Type: INDEX; Schema: shared; Owner: -
--

CREATE INDEX bundle_exports_objects ON shared.bundle_exports USING gin (object_keys);


--
-- Name: bundle_exports_release; Type: INDEX; Schema: shared; Owner: -
--

CREATE INDEX bundle_exports_release ON shared.bundle_exports USING btree (tenant_id, space_id, release_id, created_at DESC, id DESC);


--
-- Name: bundle_exports_scope; Type: INDEX; Schema: shared; Owner: -
--

CREATE INDEX bundle_exports_scope ON shared.bundle_exports USING btree (tenant_id, space_id, created_at DESC, id DESC);


--
-- Name: deletion_records_tenant_id_id_idx; Type: INDEX; Schema: shared; Owner: -
--

CREATE INDEX deletion_records_tenant_id_id_idx ON shared.deletion_records USING btree (tenant_id, id DESC);


--
-- Name: delivery_source_pins_protected_until_idx; Type: INDEX; Schema: shared; Owner: -
--

CREATE INDEX delivery_source_pins_protected_until_idx ON shared.delivery_source_pins USING btree (protected_until);


--
-- Name: event_publication_archive_by_completion_date_idx; Type: INDEX; Schema: shared; Owner: -
--

CREATE INDEX event_publication_archive_by_completion_date_idx ON shared.event_publication_archive USING btree (completion_date);


--
-- Name: event_publication_archive_serialized_event_hash_idx; Type: INDEX; Schema: shared; Owner: -
--

CREATE INDEX event_publication_archive_serialized_event_hash_idx ON shared.event_publication_archive USING hash (serialized_event);


--
-- Name: event_publication_by_completion_date_idx; Type: INDEX; Schema: shared; Owner: -
--

CREATE INDEX event_publication_by_completion_date_idx ON shared.event_publication USING btree (completion_date);


--
-- Name: event_publication_serialized_event_hash_idx; Type: INDEX; Schema: shared; Owner: -
--

CREATE INDEX event_publication_serialized_event_hash_idx ON shared.event_publication USING hash (serialized_event);


--
-- Name: idempotency_records_expires_at_idx; Type: INDEX; Schema: shared; Owner: -
--

CREATE INDEX idempotency_records_expires_at_idx ON shared.idempotency_records USING btree (expires_at);


--
-- Name: jobs_import_space_status; Type: INDEX; Schema: shared; Owner: -
--

CREATE INDEX jobs_import_space_status ON shared.jobs USING btree (space_id, status) WHERE (type = 'import'::text);


--
-- Name: jobs_type_status_created_at_idx; Type: INDEX; Schema: shared; Owner: -
--

CREATE INDEX jobs_type_status_created_at_idx ON shared.jobs USING btree (type, status, created_at);


--
-- Name: mail_outbox_created; Type: INDEX; Schema: shared; Owner: -
--

CREATE INDEX mail_outbox_created ON shared.mail_outbox USING btree (created_at DESC, id DESC);


--
-- Name: mail_outbox_due; Type: INDEX; Schema: shared; Owner: -
--

CREATE INDEX mail_outbox_due ON shared.mail_outbox USING btree (state, next_run_at, created_at) WHERE (state = ANY (ARRAY['queued'::text, 'retrying'::text]));


--
-- Name: mail_outbox_expired_lease; Type: INDEX; Schema: shared; Owner: -
--

CREATE INDEX mail_outbox_expired_lease ON shared.mail_outbox USING btree (lease_until) WHERE (state = 'running'::text);


--
-- Name: mail_outbox_recipient; Type: INDEX; Schema: shared; Owner: -
--

CREATE INDEX mail_outbox_recipient ON shared.mail_outbox USING btree (lower(recipient));


--
-- Name: mail_outbox_tenant; Type: INDEX; Schema: shared; Owner: -
--

CREATE INDEX mail_outbox_tenant ON shared.mail_outbox USING btree (tenant_id, id DESC);


--
-- Name: source_cleanup_due; Type: INDEX; Schema: shared; Owner: -
--

CREATE INDEX source_cleanup_due ON shared.source_objects USING btree (next_retry_at, protected_until) WHERE (attempts < 8);


--
-- Name: webhook_deliveries_status_next_retry_at_idx; Type: INDEX; Schema: shared; Owner: -
--

CREATE INDEX webhook_deliveries_status_next_retry_at_idx ON shared.webhook_deliveries USING btree (status, next_retry_at);


--
-- Name: webhook_deliveries_webhook_id_event_id_idx; Type: INDEX; Schema: shared; Owner: -
--

CREATE UNIQUE INDEX webhook_deliveries_webhook_id_event_id_idx ON shared.webhook_deliveries USING btree (webhook_id, event_id);


--
-- Name: delivery_publications delivery_outcome; Type: TRIGGER; Schema: shared; Owner: -
--

CREATE TRIGGER delivery_outcome AFTER UPDATE ON shared.delivery_publications FOR EACH ROW EXECUTE FUNCTION shared.record_delivery_outcome();


--
-- Name: tenants touch_updated; Type: TRIGGER; Schema: shared; Owner: -
--

CREATE TRIGGER touch_updated BEFORE UPDATE ON shared.tenants FOR EACH ROW EXECUTE FUNCTION shared.touch_updated_at();


--
-- Name: jobs jobs_tenant_id_fkey; Type: FK CONSTRAINT; Schema: shared; Owner: -
--

ALTER TABLE ONLY shared.jobs
    ADD CONSTRAINT jobs_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES shared.tenants(id);


--
-- Name: webhook_attempts webhook_attempts_delivery_id_fkey; Type: FK CONSTRAINT; Schema: shared; Owner: -
--

ALTER TABLE ONLY shared.webhook_attempts
    ADD CONSTRAINT webhook_attempts_delivery_id_fkey FOREIGN KEY (delivery_id) REFERENCES shared.webhook_deliveries(id);


--
-- Name: webhook_deliveries webhook_deliveries_webhook_id_fkey; Type: FK CONSTRAINT; Schema: shared; Owner: -
--

ALTER TABLE ONLY shared.webhook_deliveries
    ADD CONSTRAINT webhook_deliveries_webhook_id_fkey FOREIGN KEY (webhook_id) REFERENCES shared.webhooks(id);


--
-- Name: webhooks webhooks_tenant_id_fkey; Type: FK CONSTRAINT; Schema: shared; Owner: -
--

ALTER TABLE ONLY shared.webhooks
    ADD CONSTRAINT webhooks_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES shared.tenants(id);


--
-- Name: analytics_activity; Type: ROW SECURITY; Schema: shared; Owner: -
--

ALTER TABLE shared.analytics_activity ENABLE ROW LEVEL SECURITY;

--
-- Name: analytics_events; Type: ROW SECURITY; Schema: shared; Owner: -
--

ALTER TABLE shared.analytics_events ENABLE ROW LEVEL SECURITY;

--
-- Name: audit_exports; Type: ROW SECURITY; Schema: shared; Owner: -
--

ALTER TABLE shared.audit_exports ENABLE ROW LEVEL SECURITY;

--
-- Name: audit_log; Type: ROW SECURITY; Schema: shared; Owner: -
--

ALTER TABLE shared.audit_log ENABLE ROW LEVEL SECURITY;

--
-- Name: bundle_exports; Type: ROW SECURITY; Schema: shared; Owner: -
--

ALTER TABLE shared.bundle_exports ENABLE ROW LEVEL SECURITY;

--
-- Name: deletion_records; Type: ROW SECURITY; Schema: shared; Owner: -
--

ALTER TABLE shared.deletion_records ENABLE ROW LEVEL SECURITY;

--
-- Name: delivery_events; Type: ROW SECURITY; Schema: shared; Owner: -
--

ALTER TABLE shared.delivery_events ENABLE ROW LEVEL SECURITY;

--
-- Name: delivery_publications; Type: ROW SECURITY; Schema: shared; Owner: -
--

ALTER TABLE shared.delivery_publications ENABLE ROW LEVEL SECURITY;

--
-- Name: jobs; Type: ROW SECURITY; Schema: shared; Owner: -
--

ALTER TABLE shared.jobs ENABLE ROW LEVEL SECURITY;

--
-- Name: tenants; Type: ROW SECURITY; Schema: shared; Owner: -
--

ALTER TABLE shared.tenants ENABLE ROW LEVEL SECURITY;

--
-- Name: webhook_attempts; Type: ROW SECURITY; Schema: shared; Owner: -
--

ALTER TABLE shared.webhook_attempts ENABLE ROW LEVEL SECURITY;

--
-- Name: webhook_deliveries; Type: ROW SECURITY; Schema: shared; Owner: -
--

ALTER TABLE shared.webhook_deliveries ENABLE ROW LEVEL SECURITY;

--
-- Name: webhooks; Type: ROW SECURITY; Schema: shared; Owner: -
--

ALTER TABLE shared.webhooks ENABLE ROW LEVEL SECURITY;

--
-- Name: SCHEMA shared; Type: ACL; Schema: -; Owner: -
--

GRANT USAGE ON SCHEMA shared TO space_app;
GRANT USAGE ON SCHEMA shared TO delivery_outbox_worker;


--
-- Name: FUNCTION append_audit(event uuid, root uuid, event_kind text, actor_kind text, actor uuid, action_name text, target_kind text, target uuid, result text, network text, request text, summary jsonb, requested_tenant uuid, platform_scope boolean); Type: ACL; Schema: shared; Owner: -
--

REVOKE ALL ON FUNCTION shared.append_audit(event uuid, root uuid, event_kind text, actor_kind text, actor uuid, action_name text, target_kind text, target uuid, result text, network text, request text, summary jsonb, requested_tenant uuid, platform_scope boolean, credential uuid) FROM PUBLIC;
GRANT ALL ON FUNCTION shared.append_audit(event uuid, root uuid, event_kind text, actor_kind text, actor uuid, action_name text, target_kind text, target uuid, result text, network text, request text, summary jsonb, requested_tenant uuid, platform_scope boolean, credential uuid) TO space_app;


--
-- Name: TABLE audit_exports; Type: ACL; Schema: shared; Owner: -
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE shared.audit_exports TO space_app;


--
-- Name: FUNCTION claim_audit_exports(); Type: ACL; Schema: shared; Owner: -
--

REVOKE ALL ON FUNCTION shared.claim_audit_exports() FROM PUBLIC;
GRANT ALL ON FUNCTION shared.claim_audit_exports() TO space_app;


--
-- Name: TABLE delivery_publications; Type: ACL; Schema: shared; Owner: -
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE shared.delivery_publications TO space_app;


--
-- Name: FUNCTION claim_delivery_publication(p_token uuid); Type: ACL; Schema: shared; Owner: -
--

REVOKE ALL ON FUNCTION shared.claim_delivery_publication(p_token uuid) FROM PUBLIC;
GRANT ALL ON FUNCTION shared.claim_delivery_publication(p_token uuid) TO delivery_outbox_worker;


--
-- Name: TABLE reader_security_publications; Type: ACL; Schema: shared; Owner: -
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE shared.reader_security_publications TO space_app;


--
-- Name: FUNCTION claim_reader_security(p_token uuid); Type: ACL; Schema: shared; Owner: -
--

REVOKE ALL ON FUNCTION shared.claim_reader_security(p_token uuid) FROM PUBLIC;
GRANT ALL ON FUNCTION shared.claim_reader_security(p_token uuid) TO delivery_outbox_worker;


--
-- Name: FUNCTION claim_webhooks(batch_limit integer); Type: ACL; Schema: shared; Owner: -
--

REVOKE ALL ON FUNCTION shared.claim_webhooks(batch_limit integer) FROM PUBLIC;
GRANT ALL ON FUNCTION shared.claim_webhooks(batch_limit integer) TO space_app;


--
-- Name: FUNCTION current_tenant_id_or_null(); Type: ACL; Schema: shared; Owner: -
--

REVOKE ALL ON FUNCTION shared.current_tenant_id_or_null() FROM PUBLIC;
GRANT ALL ON FUNCTION shared.current_tenant_id_or_null() TO space_app;


--
-- Name: FUNCTION finish_audit_export(target uuid, token uuid, key text, reason text); Type: ACL; Schema: shared; Owner: -
--

REVOKE ALL ON FUNCTION shared.finish_audit_export(target uuid, token uuid, key text, reason text) FROM PUBLIC;
GRANT ALL ON FUNCTION shared.finish_audit_export(target uuid, token uuid, key text, reason text) TO space_app;


--
-- Name: FUNCTION finish_delivery_publication(p_site uuid, p_epoch bigint, p_token uuid, p_error text); Type: ACL; Schema: shared; Owner: -
--

REVOKE ALL ON FUNCTION shared.finish_delivery_publication(p_site uuid, p_epoch bigint, p_token uuid, p_error text) FROM PUBLIC;
GRANT ALL ON FUNCTION shared.finish_delivery_publication(p_site uuid, p_epoch bigint, p_token uuid, p_error text) TO delivery_outbox_worker;


--
-- Name: FUNCTION finish_reader_security(p_kind text, p_scope uuid, p_epoch bigint, p_token uuid, p_error text, p_retry boolean); Type: ACL; Schema: shared; Owner: -
--

REVOKE ALL ON FUNCTION shared.finish_reader_security(p_kind text, p_scope uuid, p_epoch bigint, p_token uuid, p_error text, p_retry boolean) FROM PUBLIC;
GRANT ALL ON FUNCTION shared.finish_reader_security(p_kind text, p_scope uuid, p_epoch bigint, p_token uuid, p_error text, p_retry boolean) TO delivery_outbox_worker;


--
-- Name: FUNCTION finish_webhook(delivery uuid, token uuid, result_code integer, error_code text, duration bigint); Type: ACL; Schema: shared; Owner: -
--

REVOKE ALL ON FUNCTION shared.finish_webhook(delivery uuid, token uuid, result_code integer, error_code text, duration bigint) FROM PUBLIC;
GRANT ALL ON FUNCTION shared.finish_webhook(delivery uuid, token uuid, result_code integer, error_code text, duration bigint) TO space_app;


--
-- Name: FUNCTION group_belongs_to_current_tenant(requested_group_type text, requested_group_id uuid); Type: ACL; Schema: shared; Owner: -
--

REVOKE ALL ON FUNCTION shared.group_belongs_to_current_tenant(requested_group_type text, requested_group_id uuid) FROM PUBLIC;
GRANT ALL ON FUNCTION shared.group_belongs_to_current_tenant(requested_group_type text, requested_group_id uuid) TO space_app;


--
-- Name: FUNCTION import_queue_depth(); Type: ACL; Schema: shared; Owner: -
--

REVOKE ALL ON FUNCTION shared.import_queue_depth() FROM PUBLIC;
GRANT ALL ON FUNCTION shared.import_queue_depth() TO space_app;


--
-- Name: FUNCTION pending_bundle_exports(p_limit integer); Type: ACL; Schema: shared; Owner: -
--

REVOKE ALL ON FUNCTION shared.pending_bundle_exports(p_limit integer) FROM PUBLIC;
GRANT ALL ON FUNCTION shared.pending_bundle_exports(p_limit integer) TO space_app;


--
-- Name: FUNCTION pending_imports(batch_limit integer); Type: ACL; Schema: shared; Owner: -
--

REVOKE ALL ON FUNCTION shared.pending_imports(batch_limit integer) FROM PUBLIC;
GRANT ALL ON FUNCTION shared.pending_imports(batch_limit integer) TO space_app;


--
-- Name: FUNCTION pin_delivery_source(site uuid, version bigint, lease uuid, key text); Type: ACL; Schema: shared; Owner: -
--

REVOKE ALL ON FUNCTION shared.pin_delivery_source(site uuid, version bigint, lease uuid, key text) FROM PUBLIC;
GRANT ALL ON FUNCTION shared.pin_delivery_source(site uuid, version bigint, lease uuid, key text) TO delivery_outbox_worker;


--
-- Name: TABLE audit_log; Type: ACL; Schema: shared; Owner: -
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE shared.audit_log TO space_app;


--
-- Name: FUNCTION platform_audit(); Type: ACL; Schema: shared; Owner: -
--

REVOKE ALL ON FUNCTION shared.platform_audit() FROM PUBLIC;
GRANT ALL ON FUNCTION shared.platform_audit() TO space_app;


--
-- Name: FUNCTION release_delivery_source(lease uuid, key text); Type: ACL; Schema: shared; Owner: -
--

REVOKE ALL ON FUNCTION shared.release_delivery_source(lease uuid, key text) FROM PUBLIC;
GRANT ALL ON FUNCTION shared.release_delivery_source(lease uuid, key text) TO delivery_outbox_worker;


--
-- Name: FUNCTION renew_audit_export(target uuid, token uuid); Type: ACL; Schema: shared; Owner: -
--

REVOKE ALL ON FUNCTION shared.renew_audit_export(target uuid, token uuid) FROM PUBLIC;
GRANT ALL ON FUNCTION shared.renew_audit_export(target uuid, token uuid) TO space_app;


--
-- Name: FUNCTION renew_delivery_publication(p_site uuid, p_epoch bigint, p_token uuid); Type: ACL; Schema: shared; Owner: -
--

REVOKE ALL ON FUNCTION shared.renew_delivery_publication(p_site uuid, p_epoch bigint, p_token uuid) FROM PUBLIC;
GRANT ALL ON FUNCTION shared.renew_delivery_publication(p_site uuid, p_epoch bigint, p_token uuid) TO delivery_outbox_worker;


--
-- Name: FUNCTION require_tenant_id(); Type: ACL; Schema: shared; Owner: -
--

REVOKE ALL ON FUNCTION shared.require_tenant_id() FROM PUBLIC;
GRANT ALL ON FUNCTION shared.require_tenant_id() TO space_app;


--
-- Name: FUNCTION resource_belongs_to_current_tenant(requested_resource_type text, requested_resource_id uuid); Type: ACL; Schema: shared; Owner: -
--

REVOKE ALL ON FUNCTION shared.resource_belongs_to_current_tenant(requested_resource_type text, requested_resource_id uuid) FROM PUBLIC;
GRANT ALL ON FUNCTION shared.resource_belongs_to_current_tenant(requested_resource_type text, requested_resource_id uuid) TO space_app;


--
-- Name: FUNCTION retain_audit(cutoff timestamp with time zone); Type: ACL; Schema: shared; Owner: -
--

REVOKE ALL ON FUNCTION shared.retain_audit(cutoff timestamp with time zone) FROM PUBLIC;
GRANT ALL ON FUNCTION shared.retain_audit(cutoff timestamp with time zone) TO space_app;


--
-- Name: FUNCTION runtime_provision_tenant(p_name text); Type: ACL; Schema: shared; Owner: -
--

REVOKE ALL ON FUNCTION shared.runtime_provision_tenant(p_name text) FROM PUBLIC;
GRANT ALL ON FUNCTION shared.runtime_provision_tenant(p_name text) TO space_app;


--
-- Name: FUNCTION runtime_set_tenant_status(p_id uuid, p_status text); Type: ACL; Schema: shared; Owner: -
--

REVOKE ALL ON FUNCTION shared.runtime_set_tenant_status(p_id uuid, p_status text) FROM PUBLIC;
GRANT ALL ON FUNCTION shared.runtime_set_tenant_status(p_id uuid, p_status text) TO space_app;


--
-- Name: FUNCTION runtime_tenant(p_id uuid); Type: ACL; Schema: shared; Owner: -
--

REVOKE ALL ON FUNCTION shared.runtime_tenant(p_id uuid) FROM PUBLIC;
GRANT ALL ON FUNCTION shared.runtime_tenant(p_id uuid) TO space_app;


--
-- Name: FUNCTION runtime_tenant_page(p_before_created_at timestamp with time zone, p_before_id uuid, p_limit integer); Type: ACL; Schema: shared; Owner: -
--

REVOKE ALL ON FUNCTION shared.runtime_tenant_page(p_before_created_at timestamp with time zone, p_before_id uuid, p_limit integer) FROM PUBLIC;
GRANT ALL ON FUNCTION shared.runtime_tenant_page(p_before_created_at timestamp with time zone, p_before_id uuid, p_limit integer) TO space_app;


--
-- Name: FUNCTION runtime_tenants(p_ids uuid[]); Type: ACL; Schema: shared; Owner: -
--

REVOKE ALL ON FUNCTION shared.runtime_tenants(p_ids uuid[]) FROM PUBLIC;
GRANT ALL ON FUNCTION shared.runtime_tenants(p_ids uuid[]) TO space_app;


--
-- Name: FUNCTION scrub_audit_actor(actor uuid); Type: ACL; Schema: shared; Owner: -
--

REVOKE ALL ON FUNCTION shared.scrub_audit_actor(actor uuid) FROM PUBLIC;
GRANT ALL ON FUNCTION shared.scrub_audit_actor(actor uuid) TO space_app;


--
-- Name: TABLE analytics_activity; Type: ACL; Schema: shared; Owner: -
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE shared.analytics_activity TO space_app;


--
-- Name: TABLE analytics_events; Type: ACL; Schema: shared; Owner: -
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE shared.analytics_events TO space_app;


--
-- Name: TABLE analytics_sources; Type: ACL; Schema: shared; Owner: -
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE shared.analytics_sources TO space_app;


--
-- Name: TABLE service_heartbeats; Type: ACL; Schema: shared; Owner: -
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE shared.service_heartbeats TO space_app;


--
-- Name: FUNCTION record_service_heartbeat(p_service text, p_instance text, p_version text, p_details jsonb); Type: ACL; Schema: shared; Owner: -
--

REVOKE ALL ON FUNCTION shared.record_service_heartbeat(p_service text, p_instance text, p_version text, p_details jsonb) FROM PUBLIC;
GRANT ALL ON FUNCTION shared.record_service_heartbeat(p_service text, p_instance text, p_version text, p_details jsonb) TO delivery_outbox_worker;
GRANT ALL ON FUNCTION shared.record_service_heartbeat(p_service text, p_instance text, p_version text, p_details jsonb) TO space_app;


--
-- Name: SEQUENCE audit_log_id_seq; Type: ACL; Schema: shared; Owner: -
--

GRANT SELECT,USAGE ON SEQUENCE shared.audit_log_id_seq TO space_app;


--
-- Name: TABLE audit_redacted_actors; Type: ACL; Schema: shared; Owner: -
--

GRANT SELECT,INSERT ON TABLE shared.audit_redacted_actors TO space_app;


--
-- Name: TABLE bundle_exports; Type: ACL; Schema: shared; Owner: -
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE shared.bundle_exports TO space_app;


--
-- Name: TABLE deletion_records; Type: ACL; Schema: shared; Owner: -
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE shared.deletion_records TO space_app;


--
-- Name: SEQUENCE delivery_epoch; Type: ACL; Schema: shared; Owner: -
--

GRANT SELECT,USAGE ON SEQUENCE shared.delivery_epoch TO space_app;


--
-- Name: TABLE delivery_events; Type: ACL; Schema: shared; Owner: -
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE shared.delivery_events TO space_app;


--
-- Name: TABLE delivery_source_pins; Type: ACL; Schema: shared; Owner: -
--

GRANT SELECT ON TABLE shared.delivery_source_pins TO space_app;


--
-- Name: TABLE dns_txt_stubs; Type: ACL; Schema: shared; Owner: -
--

GRANT SELECT ON TABLE shared.dns_txt_stubs TO space_app;


--
-- Name: TABLE event_publication; Type: ACL; Schema: shared; Owner: -
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE shared.event_publication TO space_app;


--
-- Name: TABLE event_publication_archive; Type: ACL; Schema: shared; Owner: -
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE shared.event_publication_archive TO space_app;


--
-- Name: TABLE idempotency_records; Type: ACL; Schema: shared; Owner: -
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE shared.idempotency_records TO space_app;


--
-- Name: TABLE jobs; Type: ACL; Schema: shared; Owner: -
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE shared.jobs TO space_app;


--
-- Name: TABLE mail_outbox; Type: ACL; Schema: shared; Owner: -
--

GRANT SELECT,INSERT,UPDATE ON TABLE shared.mail_outbox TO space_app;


--
-- Name: TABLE object_inventory_cursor; Type: ACL; Schema: shared; Owner: -
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE shared.object_inventory_cursor TO space_app;


--
-- Name: TABLE source_objects; Type: ACL; Schema: shared; Owner: -
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE shared.source_objects TO space_app;


--
-- Name: TABLE tenants; Type: ACL; Schema: shared; Owner: -
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE shared.tenants TO space_app;


--
-- Name: TABLE webhook_attempts; Type: ACL; Schema: shared; Owner: -
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE shared.webhook_attempts TO space_app;


--
-- Name: TABLE webhook_deliveries; Type: ACL; Schema: shared; Owner: -
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE shared.webhook_deliveries TO space_app;


--
-- Name: TABLE webhooks; Type: ACL; Schema: shared; Owner: -
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE shared.webhooks TO space_app;


--
-- PostgreSQL database dump complete
--

-- Reader-owned personal state is erased through a durable, narrow delivery intent.
create table shared.reader_state_erasures(
 user_id uuid primary key,
 status text not null default 'queued' check(status in ('queued','running','retrying','completed')),
 token uuid,
 lease_until timestamptz,
 attempts integer not null default 0,
 next_run_at timestamptz not null default now(),
 last_error text,
 updated_at timestamptz not null default now()
);
comment on table shared.reader_state_erasures is 'rls:infrastructure/durable personal-state erasure; worker narrow access only';
grant select,insert on shared.reader_state_erasures to space_app;

create function shared.claim_reader_state_erasure(p_token uuid) returns table(user_id uuid)
 language sql security definer set search_path=pg_catalog as $$
 update shared.reader_state_erasures e set status='running',token=p_token,
  lease_until=now()+interval '2 minutes',attempts=e.attempts+1,updated_at=now()
 where e.user_id=(select q.user_id from shared.reader_state_erasures q
  where (q.status in ('queued','retrying') and q.next_run_at<=now())
     or (q.status='running' and q.lease_until<=now())
  order by q.next_run_at,q.user_id for update skip locked limit 1)
 returning e.user_id
$$;
create function shared.finish_reader_state_erasure(p_user uuid,p_token uuid,p_error text) returns void
 language sql security definer set search_path=pg_catalog as $$
 update shared.reader_state_erasures e
 set status=case when p_error is null then 'completed' else 'retrying' end,
  token=null,lease_until=null,
  next_run_at=case when p_error is null then now() else now()+least(e.attempts,60)*interval '10 seconds' end,
  last_error=p_error,updated_at=now()
 where e.user_id=p_user and e.status='running' and e.token=p_token
$$;
revoke all on function shared.claim_reader_state_erasure(uuid),shared.finish_reader_state_erasure(uuid,uuid,text) from public;
grant execute on function shared.claim_reader_state_erasure(uuid),shared.finish_reader_state_erasure(uuid,uuid,text) to delivery_outbox_worker;

CREATE TABLE shared.identity_provisioning (
 account_id uuid PRIMARY KEY,
 recover_after timestamptz NOT NULL
);
COMMENT ON TABLE shared.identity_provisioning IS 'rls:global/provisioning-journal; opaque account intents for failed remote credential provisioning';
GRANT SELECT,INSERT,UPDATE,DELETE ON shared.identity_provisioning TO space_app;
