-- ===== context: iam identity, membership and permission =====
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
-- Name: iam; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA IF NOT EXISTS iam;


-- ===== capability: iam bootstrap and runtime APIs =====
--
-- Name: check_active_token_binding(); Type: FUNCTION; Schema: iam; Owner: -
--

CREATE FUNCTION iam.check_active_token_binding() RETURNS trigger
    LANGUAGE plpgsql
    SET search_path TO 'pg_catalog'
    AS $$
begin
  if new.revoked_at is null then
    perform 1 from authoring.spaces where id=new.space_id and tenant_id=new.tenant_id for key share;
    if not found then raise foreign_key_violation using message='active token requires an existing space'; end if;
  end if;
  return new;
end $$;


--
-- Name: runtime_delete_invites_for_email(text); Type: FUNCTION; Schema: iam; Owner: -
--

CREATE FUNCTION iam.runtime_delete_invites_for_email(p_email text) RETURNS void
    LANGUAGE sql SECURITY DEFINER
    SET search_path TO 'pg_catalog'
    AS $$ delete from iam.invites where email = p_email $$;


--
-- Name: runtime_groups_of_member(uuid, boolean); Type: FUNCTION; Schema: iam; Owner: -
--

CREATE FUNCTION iam.runtime_groups_of_member(p_member uuid, p_lock boolean) RETURNS TABLE(group_type text, group_id uuid, tenant_id uuid, role text, created_at timestamp with time zone)
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'pg_catalog'
    AS $$
begin
  if p_lock then
    return query select m.group_type, m.group_id, m.tenant_id, m.role, m.created_at
      from iam.memberships m where m.member_id = p_member
      order by m.tenant_id, m.group_type, m.group_id for update;
    return;
  end if;
  return query select m.group_type, m.group_id, m.tenant_id, m.role, m.created_at
    from iam.memberships m where m.member_id = p_member order by m.created_at asc;
end
$$;


--
-- Name: runtime_invite_by_hash(text); Type: FUNCTION; Schema: iam; Owner: -
--

CREATE FUNCTION iam.runtime_invite_by_hash(p_hash text) RETURNS TABLE(id uuid, group_type text, group_id uuid, tenant_id uuid, email text, role text, expires_at timestamp with time zone, created_at timestamp with time zone)
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'pg_catalog'
    AS $$
  select id, group_type, group_id, tenant_id, email::text, role, expires_at, created_at
    from iam.invites where token_hash = p_hash
$$;


--
-- Name: runtime_pending_invites(text); Type: FUNCTION; Schema: iam; Owner: -
--

CREATE FUNCTION iam.runtime_pending_invites(p_email text) RETURNS TABLE(token_hash text, group_type text, group_id uuid, tenant_id uuid, role text)
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'pg_catalog'
    AS $$
  select token_hash, group_type, group_id, tenant_id, role
    from iam.invites where email = p_email and expires_at > now()
   order by created_at asc
$$;


--
-- Name: runtime_permission_tenant_ids(text, uuid); Type: FUNCTION; Schema: iam; Owner: -
--

CREATE FUNCTION iam.runtime_permission_tenant_ids(p_type text, p_id uuid) RETURNS TABLE(tenant_id uuid)
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'pg_catalog'
    AS $$
  select distinct tenant_id from (
    select tenant_id from iam.permission_grants
     where principal_type = p_type and principal_id is not distinct from p_id
    union all
    select tenant_id from iam.permission_restrictions
     where principal_type = p_type and principal_id is not distinct from p_id
  ) scoped where tenant_id is not null
$$;


--
-- Name: runtime_token_secret(uuid); Type: FUNCTION; Schema: iam; Owner: -
--

CREATE FUNCTION iam.runtime_token_secret(p_id uuid) RETURNS TABLE(id uuid, tenant_id uuid, space_id uuid, secret_hash bytea, scopes text, expires_at timestamp with time zone, revoked_at timestamp with time zone)
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'pg_catalog'
    AS $$
  select id, tenant_id, space_id, secret_hash, array_to_string(scopes, ','), expires_at, revoked_at
    from iam.api_tokens where id = p_id
$$;


--
-- Name: runtime_tokens_owned_by(uuid, boolean); Type: FUNCTION; Schema: iam; Owner: -
--

CREATE FUNCTION iam.runtime_tokens_owned_by(p_owner uuid, p_include_revoked boolean) RETURNS TABLE(id uuid, owner_id uuid, tenant_id uuid, space_id uuid, name text, scopes text, expires_at timestamp with time zone, revoked_at timestamp with time zone, created_at timestamp with time zone)
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'pg_catalog'
    AS $$
  select id, owner_id, tenant_id, space_id, name, array_to_string(scopes, ','),
         expires_at, revoked_at, created_at
    from iam.api_tokens
   where owner_id = p_owner and (p_include_revoked or revoked_at is null)
   order by tenant_id, created_at desc, id desc
$$;


SET default_tablespace = '';

SET default_table_access_method = heap;

-- ===== concepts: iam identity, membership and permission state =====
--
-- Name: api_tokens; Type: TABLE; Schema: iam; Owner: -
--

CREATE TABLE iam.api_tokens (
    id uuid DEFAULT uuidv7() NOT NULL,
    tenant_id uuid NOT NULL,
    owner_id uuid NOT NULL,
    name text NOT NULL,
    space_id uuid NOT NULL,
    secret_hash bytea NOT NULL,
    scopes text[] NOT NULL,
    expires_at timestamp with time zone NOT NULL,
    revoked_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT api_tokens_name_not_blank CHECK ((btrim(name) <> ''::text)),
    CONSTRAINT api_tokens_scopes_allowed CHECK ((scopes <@ ARRAY['read'::text, 'write'::text, 'publish'::text])),
    CONSTRAINT api_tokens_scopes_nonempty CHECK ((cardinality(scopes) > 0))
);

ALTER TABLE ONLY iam.api_tokens FORCE ROW LEVEL SECURITY;


--
-- Name: TABLE api_tokens; Type: COMMENT; Schema: iam; Owner: -
--

COMMENT ON TABLE iam.api_tokens IS 'rls:tenant/direct; secret bootstrap 需窄解析入口';


--
-- Name: invites; Type: TABLE; Schema: iam; Owner: -
--

CREATE TABLE iam.invites (
    token_hash text NOT NULL,
    id uuid DEFAULT uuidv7() NOT NULL,
    tenant_id uuid DEFAULT shared.current_tenant_id_or_null(),
    group_type text NOT NULL,
    group_id uuid NOT NULL,
    email public.citext NOT NULL,
    role text NOT NULL,
    expires_at timestamp with time zone NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT invites_group_type_check CHECK ((group_type = ANY (ARRAY['tenant'::text, 'team'::text]))),
    CONSTRAINT invites_role_check CHECK ((role = ANY (ARRAY['owner'::text, 'member'::text])))
);

ALTER TABLE ONLY iam.invites FORCE ROW LEVEL SECURITY;


--
-- Name: TABLE invites; Type: COMMENT; Schema: iam; Owner: -
--

COMMENT ON TABLE iam.invites IS 'rls:tenant/direct-context-stamp; invite bootstrap 需窄解析入口';


--
-- Name: memberships; Type: TABLE; Schema: iam; Owner: -
--

CREATE TABLE iam.memberships (
    id uuid DEFAULT uuidv7() NOT NULL,
    tenant_id uuid DEFAULT shared.current_tenant_id_or_null(),
    group_type text NOT NULL,
    group_id uuid NOT NULL,
    member_id uuid NOT NULL,
    role text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT memberships_group_type_check CHECK ((group_type = ANY (ARRAY['tenant'::text, 'team'::text]))),
    CONSTRAINT memberships_role_check CHECK ((role = ANY (ARRAY['owner'::text, 'member'::text])))
);

ALTER TABLE ONLY iam.memberships FORCE ROW LEVEL SECURITY;


--
-- Name: TABLE memberships; Type: COMMENT; Schema: iam; Owner: -
--

COMMENT ON TABLE iam.memberships IS 'rls:tenant/direct-context-stamp; group 写入另校验';


--
-- Name: permission_grants; Type: TABLE; Schema: iam; Owner: -
--

CREATE TABLE iam.permission_grants (
    id uuid DEFAULT uuidv7() NOT NULL,
    tenant_id uuid DEFAULT shared.current_tenant_id_or_null(),
    resource_type text NOT NULL,
    resource_id uuid NOT NULL,
    principal_type text NOT NULL,
    principal_id uuid,
    role text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT permission_grants_principal_type_check CHECK ((principal_type = ANY (ARRAY['user'::text, 'team'::text, 'token'::text, 'anonymous'::text]))),
    CONSTRAINT permission_grants_resource_type_check CHECK ((resource_type = ANY (ARRAY['tenant'::text, 'team'::text, 'site'::text, 'space'::text, 'page'::text])))
);

ALTER TABLE ONLY iam.permission_grants FORCE ROW LEVEL SECURITY;


--
-- Name: TABLE permission_grants; Type: COMMENT; Schema: iam; Owner: -
--

COMMENT ON TABLE iam.permission_grants IS 'rls:tenant/direct-context-stamp; Permission 仍由应用判定';


--
-- Name: permission_restriction_scopes; Type: TABLE; Schema: iam; Owner: -
--

CREATE TABLE iam.permission_restriction_scopes (
    tenant_id uuid DEFAULT shared.current_tenant_id_or_null(),
    resource_type text NOT NULL,
    resource_id uuid NOT NULL,
    active boolean DEFAULT true NOT NULL,
    revision bigint DEFAULT 1 NOT NULL,
    CONSTRAINT permission_restriction_scopes_resource_type_check CHECK ((resource_type = ANY (ARRAY['site'::text, 'space'::text, 'page'::text]))),
    CONSTRAINT permission_restriction_scopes_revision_nonnegative CHECK ((revision >= 0))
);

ALTER TABLE ONLY iam.permission_restriction_scopes FORCE ROW LEVEL SECURITY;


--
-- Name: TABLE permission_restriction_scopes; Type: COMMENT; Schema: iam; Owner: -
--

COMMENT ON TABLE iam.permission_restriction_scopes IS 'rls:tenant/direct-context-stamp; Permission 范围存在性';


--
-- Name: COLUMN permission_restriction_scopes.active; Type: COMMENT; Schema: iam; Owner: -
--

COMMENT ON COLUMN iam.permission_restriction_scopes.active IS 'false keeps an optimistic-concurrency tombstone while the resource is unrestricted';


--
-- Name: COLUMN permission_restriction_scopes.revision; Type: COMMENT; Schema: iam; Owner: -
--

COMMENT ON COLUMN iam.permission_restriction_scopes.revision IS 'monotonic restriction replacement baseline; zero is reserved for a never-restricted tombstone';


--
-- Name: permission_restrictions; Type: TABLE; Schema: iam; Owner: -
--

CREATE TABLE iam.permission_restrictions (
    id uuid DEFAULT uuidv7() NOT NULL,
    tenant_id uuid DEFAULT shared.current_tenant_id_or_null(),
    resource_type text NOT NULL,
    resource_id uuid NOT NULL,
    principal_type text NOT NULL,
    principal_id uuid,
    CONSTRAINT permission_restrictions_principal_type_check CHECK ((principal_type = ANY (ARRAY['user'::text, 'team'::text, 'token'::text, 'anonymous'::text]))),
    CONSTRAINT permission_restrictions_resource_type_check CHECK ((resource_type = ANY (ARRAY['site'::text, 'space'::text, 'page'::text])))
);

ALTER TABLE ONLY iam.permission_restrictions FORCE ROW LEVEL SECURITY;


--
-- Name: TABLE permission_restrictions; Type: COMMENT; Schema: iam; Owner: -
--

COMMENT ON TABLE iam.permission_restrictions IS 'rls:tenant/direct-context-stamp; Permission 收窄成员';


--
-- Name: permission_roles; Type: TABLE; Schema: iam; Owner: -
--

CREATE TABLE iam.permission_roles (
    role text NOT NULL,
    operations text[] NOT NULL
);


--
-- Name: TABLE permission_roles; Type: COMMENT; Schema: iam; Owner: -
--

COMMENT ON TABLE iam.permission_roles IS 'rls:global/catalog; 全局只读 Operation 集';


--
-- Name: sessions; Type: TABLE; Schema: iam; Owner: -
--

CREATE TABLE iam.sessions (
    id uuid DEFAULT uuidv7() NOT NULL,
    principal_type text DEFAULT 'user'::text NOT NULL,
    principal_id uuid NOT NULL,
    refresh_token_hash text NOT NULL,
    previous_refresh_token_hash text,
    rotated_at timestamp with time zone,
    last_seen_at timestamp with time zone DEFAULT now() NOT NULL,
    ended_at timestamp with time zone,
    ip_approximate text,
    device jsonb,
    expires_at timestamp with time zone NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT sessions_principal_type_check CHECK ((principal_type = 'user'::text))
);


--
-- Name: TABLE sessions; Type: COMMENT; Schema: iam; Owner: -
--

COMMENT ON TABLE iam.sessions IS 'rls:global/authentication-bootstrap; 建立 Tenant 上下文前解析';


--
-- Name: teams; Type: TABLE; Schema: iam; Owner: -
--

CREATE TABLE iam.teams (
    id uuid DEFAULT uuidv7() NOT NULL,
    tenant_id uuid NOT NULL,
    name text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    normalized_name text NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE ONLY iam.teams FORCE ROW LEVEL SECURITY;


--
-- Name: TABLE teams; Type: COMMENT; Schema: iam; Owner: -
--

COMMENT ON TABLE iam.teams IS 'rls:tenant/direct; Team 直接属于 Tenant';


--
-- Name: users; Type: TABLE; Schema: iam; Owner: -
--

CREATE TABLE iam.users (
    id uuid DEFAULT uuidv7() NOT NULL,
    email public.citext,
    name text NOT NULL,
    avatar_url text,
    locale text,
    verified boolean DEFAULT false NOT NULL,
    verify_token_hash text,
    verify_expires_at timestamp with time zone,
    platform_operator boolean DEFAULT false NOT NULL,
    status text DEFAULT 'active'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT email_required_unless_erased CHECK (((status = 'erased'::text) OR (email IS NOT NULL))),
    CONSTRAINT users_status_check CHECK ((status = ANY (ARRAY['active'::text, 'deactivated'::text, 'erased'::text])))
);


--
-- Name: TABLE users; Type: COMMENT; Schema: iam; Owner: -
--

COMMENT ON TABLE iam.users IS 'rls:global/identity; User 是跨 Tenant 全局身份';


--
-- Name: COLUMN users.platform_operator; Type: COMMENT; Schema: iam; Owner: -
--

COMMENT ON COLUMN iam.users.platform_operator IS '平台运营员：只解锁 /admin 与 /ops 平面，对租户内资源零隐式权限；由运维手工置位';


--
-- Name: api_tokens api_tokens_pkey; Type: CONSTRAINT; Schema: iam; Owner: -
--

ALTER TABLE ONLY iam.api_tokens
    ADD CONSTRAINT api_tokens_pkey PRIMARY KEY (id);


--
-- Name: invites invites_id_unique; Type: CONSTRAINT; Schema: iam; Owner: -
--

ALTER TABLE ONLY iam.invites
    ADD CONSTRAINT invites_id_unique UNIQUE (id);


--
-- Name: invites invites_pkey; Type: CONSTRAINT; Schema: iam; Owner: -
--

ALTER TABLE ONLY iam.invites
    ADD CONSTRAINT invites_pkey PRIMARY KEY (token_hash);


--
-- Name: memberships memberships_group_type_group_id_member_id_key; Type: CONSTRAINT; Schema: iam; Owner: -
--

ALTER TABLE ONLY iam.memberships
    ADD CONSTRAINT memberships_group_type_group_id_member_id_key UNIQUE (group_type, group_id, member_id);


--
-- Name: memberships memberships_pkey; Type: CONSTRAINT; Schema: iam; Owner: -
--

ALTER TABLE ONLY iam.memberships
    ADD CONSTRAINT memberships_pkey PRIMARY KEY (id);


--
-- Name: permission_grants permission_grants_pkey; Type: CONSTRAINT; Schema: iam; Owner: -
--

ALTER TABLE ONLY iam.permission_grants
    ADD CONSTRAINT permission_grants_pkey PRIMARY KEY (id);


--
-- Name: permission_grants permission_grants_resource_type_resource_id_principal_type__key; Type: CONSTRAINT; Schema: iam; Owner: -
--

ALTER TABLE ONLY iam.permission_grants
    ADD CONSTRAINT permission_grants_resource_type_resource_id_principal_type__key UNIQUE NULLS NOT DISTINCT (resource_type, resource_id, principal_type, principal_id);


--
-- Name: permission_restriction_scopes permission_restriction_scopes_pkey; Type: CONSTRAINT; Schema: iam; Owner: -
--

ALTER TABLE ONLY iam.permission_restriction_scopes
    ADD CONSTRAINT permission_restriction_scopes_pkey PRIMARY KEY (resource_type, resource_id);


--
-- Name: permission_restriction_scopes permission_restriction_scopes_tenant_resource_key; Type: CONSTRAINT; Schema: iam; Owner: -
--

ALTER TABLE ONLY iam.permission_restriction_scopes
    ADD CONSTRAINT permission_restriction_scopes_tenant_resource_key UNIQUE (tenant_id, resource_type, resource_id);


--
-- Name: permission_restrictions permission_restrictions_pkey; Type: CONSTRAINT; Schema: iam; Owner: -
--

ALTER TABLE ONLY iam.permission_restrictions
    ADD CONSTRAINT permission_restrictions_pkey PRIMARY KEY (id);


--
-- Name: permission_restrictions permission_restrictions_resource_type_resource_id_principal_key; Type: CONSTRAINT; Schema: iam; Owner: -
--

ALTER TABLE ONLY iam.permission_restrictions
    ADD CONSTRAINT permission_restrictions_resource_type_resource_id_principal_key UNIQUE NULLS NOT DISTINCT (resource_type, resource_id, principal_type, principal_id);


--
-- Name: permission_roles permission_roles_pkey; Type: CONSTRAINT; Schema: iam; Owner: -
--

ALTER TABLE ONLY iam.permission_roles
    ADD CONSTRAINT permission_roles_pkey PRIMARY KEY (role);


--
-- Name: sessions sessions_pkey; Type: CONSTRAINT; Schema: iam; Owner: -
--

ALTER TABLE ONLY iam.sessions
    ADD CONSTRAINT sessions_pkey PRIMARY KEY (id);


--
-- Name: sessions sessions_refresh_token_hash_key; Type: CONSTRAINT; Schema: iam; Owner: -
--

ALTER TABLE ONLY iam.sessions
    ADD CONSTRAINT sessions_refresh_token_hash_key UNIQUE (refresh_token_hash);


--
-- Name: teams teams_pkey; Type: CONSTRAINT; Schema: iam; Owner: -
--

ALTER TABLE ONLY iam.teams
    ADD CONSTRAINT teams_pkey PRIMARY KEY (id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: iam; Owner: -
--

ALTER TABLE ONLY iam.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: iam; Owner: -
--

ALTER TABLE ONLY iam.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: api_tokens_owner_visible_idx; Type: INDEX; Schema: iam; Owner: -
--

CREATE INDEX api_tokens_owner_visible_idx ON iam.api_tokens USING btree (tenant_id, owner_id, created_at DESC, id DESC);


--
-- Name: api_tokens_space_visible_idx; Type: INDEX; Schema: iam; Owner: -
--

CREATE INDEX api_tokens_space_visible_idx ON iam.api_tokens USING btree (tenant_id, space_id, created_at DESC, id DESC);


--
-- Name: invites_email_idx; Type: INDEX; Schema: iam; Owner: -
--

CREATE INDEX invites_email_idx ON iam.invites USING btree (email);


--
-- Name: invites_tenant_id_email_idx; Type: INDEX; Schema: iam; Owner: -
--

CREATE INDEX invites_tenant_id_email_idx ON iam.invites USING btree (tenant_id, email);


--
-- Name: memberships_tenant_id_member_id_idx; Type: INDEX; Schema: iam; Owner: -
--

CREATE INDEX memberships_tenant_id_member_id_idx ON iam.memberships USING btree (tenant_id, member_id);


--
-- Name: permission_grants_resource_type_resource_id_idx; Type: INDEX; Schema: iam; Owner: -
--

CREATE INDEX permission_grants_resource_type_resource_id_idx ON iam.permission_grants USING btree (resource_type, resource_id);


--
-- Name: permission_grants_tenant_id_resource_type_resource_id_idx; Type: INDEX; Schema: iam; Owner: -
--

CREATE INDEX permission_grants_tenant_id_resource_type_resource_id_idx ON iam.permission_grants USING btree (tenant_id, resource_type, resource_id);


--
-- Name: permission_restrictions_tenant_id_resource_type_resource_id_idx; Type: INDEX; Schema: iam; Owner: -
--

CREATE INDEX permission_restrictions_tenant_id_resource_type_resource_id_idx ON iam.permission_restrictions USING btree (tenant_id, resource_type, resource_id);


--
-- Name: sessions_active_principal; Type: INDEX; Schema: iam; Owner: -
--

CREATE INDEX sessions_active_principal ON iam.sessions USING btree (principal_id, created_at DESC) WHERE (ended_at IS NULL);


--
-- Name: sessions_previous_refresh_hash; Type: INDEX; Schema: iam; Owner: -
--

CREATE UNIQUE INDEX sessions_previous_refresh_hash ON iam.sessions USING btree (previous_refresh_token_hash) WHERE (previous_refresh_token_hash IS NOT NULL);


--
-- Name: sessions_principal_id_idx; Type: INDEX; Schema: iam; Owner: -
--

CREATE INDEX sessions_principal_id_idx ON iam.sessions USING btree (principal_id);


--
-- Name: teams_tenant_created_page; Type: INDEX; Schema: iam; Owner: -
--

CREATE INDEX teams_tenant_created_page ON iam.teams USING btree (tenant_id, created_at DESC, id DESC);


--
-- Name: teams_tenant_normalized_name_unique; Type: INDEX; Schema: iam; Owner: -
--

CREATE UNIQUE INDEX teams_tenant_normalized_name_unique ON iam.teams USING btree (tenant_id, normalized_name);


--
-- Name: api_tokens active_token_binding; Type: TRIGGER; Schema: iam; Owner: -
--

CREATE TRIGGER active_token_binding BEFORE INSERT OR UPDATE ON iam.api_tokens FOR EACH ROW EXECUTE FUNCTION iam.check_active_token_binding();


--
-- Name: teams touch_updated; Type: TRIGGER; Schema: iam; Owner: -
--

CREATE TRIGGER touch_updated BEFORE UPDATE ON iam.teams FOR EACH ROW EXECUTE FUNCTION shared.touch_updated_at();


--
-- Name: users touch_updated; Type: TRIGGER; Schema: iam; Owner: -
--

CREATE TRIGGER touch_updated BEFORE UPDATE ON iam.users FOR EACH ROW EXECUTE FUNCTION shared.touch_updated_at();


--
-- Name: check_populated_group_has_owner(); Type: FUNCTION; Schema: iam; Owner: -
--
-- SECURITY DEFINER + row_security off：延迟约束在 COMMIT 时触发，此时租户 GUC
-- 往往已随 inTenant 退出清掉；函数必须看见该群体的全部成员行，不能再走 RLS。
--

CREATE FUNCTION iam.check_populated_group_has_owner() RETURNS trigger
    LANGUAGE plpgsql
    SECURITY DEFINER
    SET search_path TO 'pg_catalog'
    SET row_security TO 'off'
    AS $$
declare
  gtype text;
  gid uuid;
begin
  gtype = coalesce(new.group_type, old.group_type);
  gid = coalesce(new.group_id, old.group_id);
  if exists (select 1 from iam.memberships where group_type = gtype and group_id = gid)
     and not exists (select 1 from iam.memberships where group_type = gtype and group_id = gid and role = 'owner')
  then
    raise exception using errcode = '23514', message = 'populated group must have an owner';
  end if;
  return null;
end
$$;


--
-- Name: check_team_member_is_tenant_member(); Type: FUNCTION; Schema: iam; Owner: -
--
-- 同上：提交时核对净状态，不依赖仍持有的 tenant GUC。
--

CREATE FUNCTION iam.check_team_member_is_tenant_member() RETURNS trigger
    LANGUAGE plpgsql
    SECURITY DEFINER
    SET search_path TO 'pg_catalog'
    SET row_security TO 'off'
    AS $$
declare
  member uuid;
  tenant uuid;
begin
  member = coalesce(new.member_id, old.member_id);
  tenant = coalesce(new.tenant_id, old.tenant_id);
  if exists (
        select 1 from iam.memberships
         where member_id = member and group_type = 'team' and tenant_id = tenant)
     and not exists (
        select 1 from iam.memberships
         where member_id = member and group_type = 'tenant' and group_id = tenant)
  then
    raise exception using errcode = '23514', message = 'team member must belong to the tenant';
  end if;
  return null;
end
$$;


--
-- Name: memberships memberships_populated_has_owner; Type: TRIGGER; Schema: iam; Owner: -
--

CREATE CONSTRAINT TRIGGER memberships_populated_has_owner
    AFTER INSERT OR UPDATE OR DELETE ON iam.memberships
    DEFERRABLE INITIALLY DEFERRED
    FOR EACH ROW
    EXECUTE FUNCTION iam.check_populated_group_has_owner();


--
-- Name: memberships memberships_team_subset_tenant; Type: TRIGGER; Schema: iam; Owner: -
--

CREATE CONSTRAINT TRIGGER memberships_team_subset_tenant
    AFTER INSERT OR UPDATE OR DELETE ON iam.memberships
    DEFERRABLE INITIALLY DEFERRED
    FOR EACH ROW
    EXECUTE FUNCTION iam.check_team_member_is_tenant_member();


--
-- Name: api_tokens api_tokens_owner_id_fkey; Type: CONSTRAINT; Schema: iam; Owner: -
--

ALTER TABLE ONLY iam.api_tokens
    ADD CONSTRAINT api_tokens_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES iam.users(id);


--
-- Name: api_tokens api_tokens_tenant_id_fkey; Type: FK CONSTRAINT; Schema: iam; Owner: -
--

ALTER TABLE ONLY iam.api_tokens
    ADD CONSTRAINT api_tokens_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES shared.tenants(id);


--
-- Name: invites invites_tenant_id_fkey; Type: FK CONSTRAINT; Schema: iam; Owner: -
--

ALTER TABLE ONLY iam.invites
    ADD CONSTRAINT invites_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES shared.tenants(id);


--
-- Name: memberships memberships_member_id_fkey; Type: FK CONSTRAINT; Schema: iam; Owner: -
--

ALTER TABLE ONLY iam.memberships
    ADD CONSTRAINT memberships_member_id_fkey FOREIGN KEY (member_id) REFERENCES iam.users(id);


--
-- Name: memberships memberships_tenant_id_fkey; Type: FK CONSTRAINT; Schema: iam; Owner: -
--

ALTER TABLE ONLY iam.memberships
    ADD CONSTRAINT memberships_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES shared.tenants(id);


--
-- Name: permission_grants permission_grants_role_fkey; Type: FK CONSTRAINT; Schema: iam; Owner: -
--

ALTER TABLE ONLY iam.permission_grants
    ADD CONSTRAINT permission_grants_role_fkey FOREIGN KEY (role) REFERENCES iam.permission_roles(role);


--
-- Name: permission_grants permission_grants_tenant_id_fkey; Type: FK CONSTRAINT; Schema: iam; Owner: -
--

ALTER TABLE ONLY iam.permission_grants
    ADD CONSTRAINT permission_grants_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES shared.tenants(id);


--
-- Name: permission_restriction_scopes permission_restriction_scopes_tenant_id_fkey; Type: FK CONSTRAINT; Schema: iam; Owner: -
--

ALTER TABLE ONLY iam.permission_restriction_scopes
    ADD CONSTRAINT permission_restriction_scopes_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES shared.tenants(id);


--
-- Name: permission_restrictions permission_restrictions_scope_fk; Type: FK CONSTRAINT; Schema: iam; Owner: -
--

ALTER TABLE ONLY iam.permission_restrictions
    ADD CONSTRAINT permission_restrictions_scope_fk FOREIGN KEY (tenant_id, resource_type, resource_id) REFERENCES iam.permission_restriction_scopes(tenant_id, resource_type, resource_id) ON DELETE CASCADE;


--
-- Name: permission_restrictions permission_restrictions_tenant_id_fkey; Type: FK CONSTRAINT; Schema: iam; Owner: -
--

ALTER TABLE ONLY iam.permission_restrictions
    ADD CONSTRAINT permission_restrictions_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES shared.tenants(id);


--
-- Name: teams teams_tenant_id_fkey; Type: FK CONSTRAINT; Schema: iam; Owner: -
--

ALTER TABLE ONLY iam.teams
    ADD CONSTRAINT teams_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES shared.tenants(id);


--
-- Name: api_tokens; Type: ROW SECURITY; Schema: iam; Owner: -
--

ALTER TABLE iam.api_tokens ENABLE ROW LEVEL SECURITY;

--
-- Name: invites; Type: ROW SECURITY; Schema: iam; Owner: -
--

ALTER TABLE iam.invites ENABLE ROW LEVEL SECURITY;

--
-- Name: memberships; Type: ROW SECURITY; Schema: iam; Owner: -
--

ALTER TABLE iam.memberships ENABLE ROW LEVEL SECURITY;

--
-- Name: permission_grants; Type: ROW SECURITY; Schema: iam; Owner: -
--

ALTER TABLE iam.permission_grants ENABLE ROW LEVEL SECURITY;

--
-- Name: permission_restriction_scopes; Type: ROW SECURITY; Schema: iam; Owner: -
--

ALTER TABLE iam.permission_restriction_scopes ENABLE ROW LEVEL SECURITY;

--
-- Name: permission_restrictions; Type: ROW SECURITY; Schema: iam; Owner: -
--

ALTER TABLE iam.permission_restrictions ENABLE ROW LEVEL SECURITY;

--
-- Name: teams; Type: ROW SECURITY; Schema: iam; Owner: -
--

ALTER TABLE iam.teams ENABLE ROW LEVEL SECURITY;

--
-- Name: SCHEMA iam; Type: ACL; Schema: -; Owner: -
--

GRANT USAGE ON SCHEMA iam TO space_app;


--
-- Name: FUNCTION runtime_delete_invites_for_email(p_email text); Type: ACL; Schema: iam; Owner: -
--

REVOKE ALL ON FUNCTION iam.runtime_delete_invites_for_email(p_email text) FROM PUBLIC;
GRANT ALL ON FUNCTION iam.runtime_delete_invites_for_email(p_email text) TO space_app;


--
-- Name: FUNCTION runtime_groups_of_member(p_member uuid, p_lock boolean); Type: ACL; Schema: iam; Owner: -
--

REVOKE ALL ON FUNCTION iam.runtime_groups_of_member(p_member uuid, p_lock boolean) FROM PUBLIC;
GRANT ALL ON FUNCTION iam.runtime_groups_of_member(p_member uuid, p_lock boolean) TO space_app;


--
-- Name: FUNCTION runtime_invite_by_hash(p_hash text); Type: ACL; Schema: iam; Owner: -
--

REVOKE ALL ON FUNCTION iam.runtime_invite_by_hash(p_hash text) FROM PUBLIC;
GRANT ALL ON FUNCTION iam.runtime_invite_by_hash(p_hash text) TO space_app;


--
-- Name: FUNCTION runtime_pending_invites(p_email text); Type: ACL; Schema: iam; Owner: -
--

REVOKE ALL ON FUNCTION iam.runtime_pending_invites(p_email text) FROM PUBLIC;
GRANT ALL ON FUNCTION iam.runtime_pending_invites(p_email text) TO space_app;


--
-- Name: FUNCTION runtime_permission_tenant_ids(p_type text, p_id uuid); Type: ACL; Schema: iam; Owner: -
--

REVOKE ALL ON FUNCTION iam.runtime_permission_tenant_ids(p_type text, p_id uuid) FROM PUBLIC;
GRANT ALL ON FUNCTION iam.runtime_permission_tenant_ids(p_type text, p_id uuid) TO space_app;


--
-- Name: FUNCTION runtime_token_secret(p_id uuid); Type: ACL; Schema: iam; Owner: -
--

REVOKE ALL ON FUNCTION iam.runtime_token_secret(p_id uuid) FROM PUBLIC;
GRANT ALL ON FUNCTION iam.runtime_token_secret(p_id uuid) TO space_app;


--
-- Name: FUNCTION runtime_tokens_owned_by(p_owner uuid, p_include_revoked boolean); Type: ACL; Schema: iam; Owner: -
--

REVOKE ALL ON FUNCTION iam.runtime_tokens_owned_by(p_owner uuid, p_include_revoked boolean) FROM PUBLIC;
GRANT ALL ON FUNCTION iam.runtime_tokens_owned_by(p_owner uuid, p_include_revoked boolean) TO space_app;


--
-- Name: TABLE api_tokens; Type: ACL; Schema: iam; Owner: -
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE iam.api_tokens TO space_app;


--
-- Name: TABLE invites; Type: ACL; Schema: iam; Owner: -
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE iam.invites TO space_app;


--
-- Name: TABLE memberships; Type: ACL; Schema: iam; Owner: -
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE iam.memberships TO space_app;


--
-- Name: TABLE permission_grants; Type: ACL; Schema: iam; Owner: -
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE iam.permission_grants TO space_app;


--
-- Name: TABLE permission_restriction_scopes; Type: ACL; Schema: iam; Owner: -
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE iam.permission_restriction_scopes TO space_app;


--
-- Name: TABLE permission_restrictions; Type: ACL; Schema: iam; Owner: -
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE iam.permission_restrictions TO space_app;


--
-- Name: TABLE permission_roles; Type: ACL; Schema: iam; Owner: -
--

GRANT SELECT ON TABLE iam.permission_roles TO space_app;


--
-- Name: TABLE sessions; Type: ACL; Schema: iam; Owner: -
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE iam.sessions TO space_app;


--
-- Name: TABLE teams; Type: ACL; Schema: iam; Owner: -
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE iam.teams TO space_app;


--
-- Name: TABLE users; Type: ACL; Schema: iam; Owner: -
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE iam.users TO space_app;


--
-- PostgreSQL database dump complete
--



-- ===== concept: iam.permission seed catalog =====
insert into iam.permission_roles (role, operations) values
  ('admin', '{read,write,publish,admin}'),
  ('maintainer', '{read,write,publish}'),
  ('author', '{read,write}'),
  ('reader', '{read}'),
  ('none', '{}');

-- Versioned User facts projected into the independent Identity database; no credentials.
create sequence shared.identity_publication_epochs;
create table shared.identity_publications(
 user_id uuid primary key,
 epoch bigint not null,
 revocation_version bigint not null default 0 check(revocation_version>=0),
 payload jsonb not null,
 status text not null default 'queued' check(status in ('queued','running','retrying','completed')),
 token uuid,
 lease_until timestamptz,
 attempts integer not null default 0,
 next_run_at timestamptz not null default now(),
 last_error text,
 updated_at timestamptz not null default now()
);
comment on table shared.identity_publications is 'rls:infrastructure/derived account projection; worker narrow access only';

create function shared.queue_identity_snapshot(p_user uuid) returns void
 language plpgsql security definer set search_path=pg_catalog as $$
declare snapshot jsonb;
begin
 -- Acquire the publication row before reading User facts. A competing queue must not
 -- overwrite a just-committed deactivation with facts it read before waiting.
 perform 1 from shared.identity_publications p where p.user_id=p_user for update;
 select jsonb_build_object('id',u.id,'email',u.email,'name',u.name,'verified',u.verified,
  'status',u.status,'revocationVersion',0) into snapshot
 from iam.users u where u.id=p_user;
 if snapshot is null then return; end if;
 insert into shared.identity_publications(user_id,epoch,payload)
 values(p_user,nextval('shared.identity_publication_epochs'),snapshot)
 on conflict(user_id) do update set epoch=nextval('shared.identity_publication_epochs'),
  payload=jsonb_set(excluded.payload,'{revocationVersion}',to_jsonb(shared.identity_publications.revocation_version)),
  status='queued',token=null,lease_until=null,attempts=0,next_run_at=now(),last_error=null,updated_at=now();
end $$;
create function shared.queue_identity_user_trigger() returns trigger
 language plpgsql security definer set search_path=pg_catalog as $$
begin
 perform shared.queue_identity_snapshot(NEW.id);
 return null;
end $$;
create trigger identity_user_snapshot after insert or update on iam.users
 for each row execute function shared.queue_identity_user_trigger();

create function shared.claim_identity_snapshot(p_token uuid)
 returns table(user_id uuid,epoch bigint,payload jsonb)
 language sql security definer set search_path=pg_catalog as $$
 update shared.identity_publications p set status='running',token=p_token,
  lease_until=now()+interval '2 minutes',attempts=p.attempts+1,updated_at=now()
 where p.user_id=(select q.user_id from shared.identity_publications q
  where (q.status in ('queued','retrying') and q.next_run_at<=now())
     or (q.status='running' and q.lease_until<=now())
  order by q.next_run_at,q.user_id for update skip locked limit 1)
 returning p.user_id,p.epoch,p.payload
$$;
create function shared.finish_identity_snapshot(p_user uuid,p_epoch bigint,p_token uuid,p_error text)
 returns void language sql security definer set search_path=pg_catalog as $$
 update shared.identity_publications p
 set status=case when p_error is null then 'completed' else 'retrying' end,
  token=null,lease_until=null,
  next_run_at=case when p_error is null then now() else now()+least(p.attempts,60)*interval '1 second' end,
  last_error=p_error,updated_at=now()
 where p.user_id=p_user and p.epoch=p_epoch and p.status='running' and p.token=p_token
$$;
revoke all on function shared.queue_identity_snapshot(uuid),shared.queue_identity_user_trigger(),
 shared.claim_identity_snapshot(uuid),shared.finish_identity_snapshot(uuid,bigint,uuid,text) from public;
grant execute on function shared.claim_identity_snapshot(uuid),shared.finish_identity_snapshot(uuid,bigint,uuid,text)
 to delivery_outbox_worker;

grant execute on function shared.queue_identity_snapshot(uuid) to space_app;
-- Global logout and safety narrowing publish a new identity epoch before source commit.
create function shared.revoke_identity_sessions(p_user uuid) returns bigint
 language plpgsql security definer set search_path=pg_catalog as $$
declare issued bigint;
begin
 perform shared.queue_identity_snapshot(p_user);
 update shared.identity_publications p
 set revocation_version=p.revocation_version+1,
  payload=jsonb_set(p.payload,'{revocationVersion}',to_jsonb(p.revocation_version+1)),updated_at=now()
 where p.user_id=p_user returning p.epoch into issued;
 return issued;
end $$;
revoke all on function shared.revoke_identity_sessions(uuid) from public;
grant execute on function shared.revoke_identity_sessions(uuid) to space_app;

-- Session-owned fail-closed intent, committed before a remote credential mutation.
CREATE TABLE iam.session_revocations (
 operation_id uuid PRIMARY KEY,
 user_id uuid NOT NULL,
 lease_until timestamptz NOT NULL
);
CREATE INDEX session_revocations_holder ON iam.session_revocations(user_id);
COMMENT ON TABLE iam.session_revocations IS 'rls:global/session-security; credential operations revoke sessions before releasing their durable fence';
GRANT SELECT,INSERT,UPDATE,DELETE ON iam.session_revocations TO space_app;

-- ManagementToken owns user-bound automation credentials, independent of Session and ApiToken.
CREATE TABLE iam.management_tokens (
 id uuid PRIMARY KEY,
 owner_id uuid NOT NULL REFERENCES iam.users(id),
 name text NOT NULL CHECK (char_length(btrim(name)) BETWEEN 1 AND 120),
 secret_hash bytea NOT NULL CHECK (octet_length(secret_hash)=32),
 scopes text[] NOT NULL CHECK (cardinality(scopes)>0 AND scopes <@ ARRAY[
  'content:read','content:write','content:publish','members:read','members:write',
  'permissions:read','permissions:write','hosting:read','hosting:write','audit:read',
  'operations:read','operations:write','account:read','account:write',
  'platform:read','platform:write','platform:erase']::text[]),
 tenant_id uuid,
 expires_at timestamptz NOT NULL,
 created_at timestamptz NOT NULL,
 last_used_at timestamptz,
 revoked_at timestamptz,
 CHECK (expires_at>created_at AND expires_at<=created_at+interval '365 days'),
 CHECK (tenant_id IS NULL OR NOT scopes && ARRAY['platform:read','platform:write','platform:erase']::text[])
);
CREATE INDEX management_tokens_owner_page ON iam.management_tokens(owner_id,created_at DESC,id DESC);
COMMENT ON TABLE iam.management_tokens IS 'rls:global/management-token-security; owner lookup and lifecycle are mediated by authenticated user flows';
GRANT SELECT,INSERT,UPDATE,DELETE ON iam.management_tokens TO space_app;
