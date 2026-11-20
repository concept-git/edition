-- ===== context: hosting site and search projection =====
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
-- Name: hosting; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA IF NOT EXISTS hosting;


-- ===== capability: delivery runtime APIs =====
--
-- Name: runtime_reclaim_expired_unverified(text, interval); Type: FUNCTION; Schema: hosting; Owner: -
--

CREATE FUNCTION hosting.runtime_reclaim_expired_unverified(p_host text, p_ttl interval) RETURNS boolean
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'pg_catalog'
    AS $$
declare
  deleted integer := 0;
begin
  delete from hosting.custom_domains
   where host = p_host
     and verified = false
     and created_at + p_ttl < now();
  get diagnostics deleted = row_count;
  return deleted > 0;
end
$$;


--
-- Name: runtime_resolve_host(text); Type: FUNCTION; Schema: hosting; Owner: -
--

-- Occupancy lookup for bindTaken: includes unverified rows. CustomDomain._resolve
-- filters verified in Java (CONCEPT: 仅已核验绑定).
CREATE FUNCTION hosting.runtime_resolve_host(p_host text) RETURNS TABLE(site_id uuid, tenant_id uuid, verified boolean, is_primary boolean, created_at timestamp with time zone)
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'pg_catalog'
    AS $$
  select d.site_id, s.tenant_id, d.verified, d.is_primary, d.created_at
    from hosting.custom_domains d
    join hosting.sites s on s.id = d.site_id
   where d.host = p_host
$$;


--

--
-- Name: custom_domains; Type: TABLE; Schema: hosting; Owner: -
--

CREATE TABLE hosting.custom_domains (
    host text NOT NULL,
    site_id uuid NOT NULL,
    verified boolean DEFAULT false NOT NULL,
    is_primary boolean DEFAULT false NOT NULL,
    dns_token text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT custom_domains_primary_verified CHECK (((NOT is_primary) OR verified))
);

ALTER TABLE ONLY hosting.custom_domains FORCE ROW LEVEL SECURITY;


--
-- Name: TABLE custom_domains; Type: COMMENT; Schema: hosting; Owner: -
--

COMMENT ON TABLE hosting.custom_domains IS 'rls:tenant/via-site; host bootstrap 需窄解析入口';


--
-- Name: redirects; Type: TABLE; Schema: hosting; Owner: -
--

CREATE TABLE hosting.redirects (
    site_id uuid NOT NULL,
    path text NOT NULL,
    target_type text NOT NULL,
    target_id uuid NOT NULL,
    origin text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT redirects_origin_check CHECK ((origin = ANY (ARRAY['auto'::text, 'manual'::text]))),
    CONSTRAINT redirects_target_type_check CHECK ((target_type = ANY (ARRAY['space'::text, 'page'::text])))
);

ALTER TABLE ONLY hosting.redirects FORCE ROW LEVEL SECURITY;


--
-- Name: TABLE redirects; Type: COMMENT; Schema: hosting; Owner: -
--

COMMENT ON TABLE hosting.redirects IS 'rls:tenant/via-site; target 写入另校验且允许后续悬挂';


--
-- Name: search_settings; Type: TABLE; Schema: hosting; Owner: -
--

CREATE TABLE hosting.search_settings (
    site_id uuid NOT NULL,
    tenant_id uuid DEFAULT shared.require_tenant_id() NOT NULL,
    fields text[] NOT NULL,
    revision bigint NOT NULL,
    CONSTRAINT search_settings_fields_check CHECK (((cardinality(fields) = 3) AND (fields @> ARRAY['title'::text, 'headings'::text, 'body'::text]))),
    CONSTRAINT search_settings_revision_check CHECK ((revision > 0))
);

ALTER TABLE ONLY hosting.search_settings FORCE ROW LEVEL SECURITY;


--
-- Name: TABLE search_settings; Type: COMMENT; Schema: hosting; Owner: -
--

COMMENT ON TABLE hosting.search_settings IS 'rls:tenant/direct; desired search order and rebuild revision';


--
-- Name: site_mounts; Type: TABLE; Schema: hosting; Owner: -
--

CREATE TABLE hosting.site_mounts (
    site_id uuid NOT NULL,
    slug text NOT NULL,
    space_id uuid NOT NULL,
    "position" integer NOT NULL
);

ALTER TABLE ONLY hosting.site_mounts FORCE ROW LEVEL SECURITY;


--
-- Name: TABLE site_mounts; Type: COMMENT; Schema: hosting; Owner: -
--

COMMENT ON TABLE hosting.site_mounts IS 'rls:tenant/via-site; Space 写入另校验';


--
-- Name: sites; Type: TABLE; Schema: hosting; Owner: -
--

CREATE TABLE hosting.sites (
    id uuid DEFAULT uuidv7() NOT NULL,
    tenant_id uuid NOT NULL,
    name text NOT NULL,
    path_rule text DEFAULT '/{slug}/{itemPath}'::text NOT NULL,
    title_template text,
    branding jsonb DEFAULT '{}'::jsonb NOT NULL,
    locale text,
    analytics_id text,
    robots_policy text DEFAULT 'index'::text NOT NULL,
    home_space_id uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    created_by uuid,
    updated_by uuid,
    CONSTRAINT sites_robots_policy_check CHECK ((robots_policy = ANY (ARRAY['index'::text, 'noindex'::text])))
);

ALTER TABLE ONLY hosting.sites FORCE ROW LEVEL SECURITY;


--
-- Name: TABLE sites; Type: COMMENT; Schema: hosting; Owner: -
--

COMMENT ON TABLE hosting.sites IS 'rls:tenant/direct; Site 根资源';


--
-- Name: custom_domains custom_domains_pkey; Type: CONSTRAINT; Schema: hosting; Owner: -
--

ALTER TABLE ONLY hosting.custom_domains
    ADD CONSTRAINT custom_domains_pkey PRIMARY KEY (host);


--
-- Name: redirects redirects_pkey; Type: CONSTRAINT; Schema: hosting; Owner: -
--

ALTER TABLE ONLY hosting.redirects
    ADD CONSTRAINT redirects_pkey PRIMARY KEY (site_id, path);


--
-- Name: search_settings search_settings_pkey; Type: CONSTRAINT; Schema: hosting; Owner: -
--

ALTER TABLE ONLY hosting.search_settings
    ADD CONSTRAINT search_settings_pkey PRIMARY KEY (site_id);


--
-- Name: site_mounts site_mounts_pkey; Type: CONSTRAINT; Schema: hosting; Owner: -
--

ALTER TABLE ONLY hosting.site_mounts
    ADD CONSTRAINT site_mounts_pkey PRIMARY KEY (site_id, slug);


--
-- Name: sites sites_pkey; Type: CONSTRAINT; Schema: hosting; Owner: -
--

ALTER TABLE ONLY hosting.sites
    ADD CONSTRAINT sites_pkey PRIMARY KEY (id);


--
-- Name: delivery_site_mounts_one_space_per_site; Type: INDEX; Schema: hosting; Owner: -
--

CREATE UNIQUE INDEX delivery_site_mounts_one_space_per_site ON hosting.site_mounts USING btree (site_id, space_id);


--
-- Name: delivery_sites_tenant_updated_page; Type: INDEX; Schema: hosting; Owner: -
--

CREATE INDEX delivery_sites_tenant_updated_page ON hosting.sites USING btree (tenant_id, updated_at DESC, id DESC);


--
-- Name: one_primary_domain_per_site; Type: INDEX; Schema: hosting; Owner: -
--

CREATE UNIQUE INDEX one_primary_domain_per_site ON hosting.custom_domains USING btree (site_id) WHERE is_primary;


--
-- Name: site_mounts_space_id_idx; Type: INDEX; Schema: hosting; Owner: -
--

CREATE INDEX site_mounts_space_id_idx ON hosting.site_mounts USING btree (space_id);


--
-- Name: sites_tenant_id_idx; Type: INDEX; Schema: hosting; Owner: -
--

CREATE INDEX sites_tenant_id_idx ON hosting.sites USING btree (tenant_id);


--
-- Name: sites touch_updated; Type: TRIGGER; Schema: hosting; Owner: -
--

CREATE TRIGGER touch_updated BEFORE UPDATE ON hosting.sites FOR EACH ROW EXECUTE FUNCTION shared.touch_updated_at();


--
-- Name: custom_domains custom_domains_site_id_fkey; Type: FK CONSTRAINT; Schema: hosting; Owner: -
--

ALTER TABLE ONLY hosting.custom_domains
    ADD CONSTRAINT custom_domains_site_id_fkey FOREIGN KEY (site_id) REFERENCES hosting.sites(id);


--
-- Name: redirects redirects_site_id_fkey; Type: FK CONSTRAINT; Schema: hosting; Owner: -
--

ALTER TABLE ONLY hosting.redirects
    ADD CONSTRAINT redirects_site_id_fkey FOREIGN KEY (site_id) REFERENCES hosting.sites(id);


--
-- Name: site_mounts site_mounts_site_id_fkey; Type: FK CONSTRAINT; Schema: hosting; Owner: -
--

ALTER TABLE ONLY hosting.site_mounts
    ADD CONSTRAINT site_mounts_site_id_fkey FOREIGN KEY (site_id) REFERENCES hosting.sites(id);


--
-- Name: site_mounts site_mounts_space_id_fkey; Type: FK CONSTRAINT; Schema: hosting; Owner: -
--

ALTER TABLE ONLY hosting.site_mounts
    ADD CONSTRAINT site_mounts_space_id_fkey FOREIGN KEY (space_id) REFERENCES authoring.spaces(id);


--
-- Name: sites sites_home_space_same_tenant_fk; Type: FK CONSTRAINT; Schema: hosting; Owner: -
--

ALTER TABLE ONLY hosting.sites
    ADD CONSTRAINT sites_home_space_same_tenant_fk FOREIGN KEY (tenant_id, home_space_id) REFERENCES authoring.spaces(tenant_id, id);


--
-- Name: sites sites_tenant_id_fkey; Type: FK CONSTRAINT; Schema: hosting; Owner: -
--

ALTER TABLE ONLY hosting.sites
    ADD CONSTRAINT sites_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES shared.tenants(id);


--
-- Name: custom_domains; Type: ROW SECURITY; Schema: hosting; Owner: -
--

ALTER TABLE hosting.custom_domains ENABLE ROW LEVEL SECURITY;

--
-- Name: redirects; Type: ROW SECURITY; Schema: hosting; Owner: -
--

ALTER TABLE hosting.redirects ENABLE ROW LEVEL SECURITY;

--
-- Name: search_settings; Type: ROW SECURITY; Schema: hosting; Owner: -
--

ALTER TABLE hosting.search_settings ENABLE ROW LEVEL SECURITY;

--
-- Name: site_mounts; Type: ROW SECURITY; Schema: hosting; Owner: -
--

ALTER TABLE hosting.site_mounts ENABLE ROW LEVEL SECURITY;

--
-- Name: sites; Type: ROW SECURITY; Schema: hosting; Owner: -
--

ALTER TABLE hosting.sites ENABLE ROW LEVEL SECURITY;

--
-- Name: SCHEMA delivery; Type: ACL; Schema: -; Owner: -
--

GRANT USAGE ON SCHEMA hosting TO space_app;


--
-- Name: FUNCTION runtime_reclaim_expired_unverified(p_host text, p_ttl interval); Type: ACL; Schema: hosting; Owner: -
--

REVOKE ALL ON FUNCTION hosting.runtime_reclaim_expired_unverified(p_host text, p_ttl interval) FROM PUBLIC;
GRANT ALL ON FUNCTION hosting.runtime_reclaim_expired_unverified(p_host text, p_ttl interval) TO space_app;


--
-- Name: FUNCTION runtime_resolve_host(p_host text); Type: ACL; Schema: hosting; Owner: -
--

REVOKE ALL ON FUNCTION hosting.runtime_resolve_host(p_host text) FROM PUBLIC;
GRANT ALL ON FUNCTION hosting.runtime_resolve_host(p_host text) TO space_app;


--
-- Name: TABLE custom_domains; Type: ACL; Schema: hosting; Owner: -
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE hosting.custom_domains TO space_app;


--
-- Name: TABLE redirects; Type: ACL; Schema: hosting; Owner: -
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE hosting.redirects TO space_app;


--
-- Name: TABLE search_settings; Type: ACL; Schema: hosting; Owner: -
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE hosting.search_settings TO space_app;


--
-- Name: TABLE site_mounts; Type: ACL; Schema: hosting; Owner: -
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE hosting.site_mounts TO space_app;


--
-- Name: TABLE sites; Type: ACL; Schema: hosting; Owner: -
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE hosting.sites TO space_app;


--
-- PostgreSQL database dump complete
--



-- ===== capability: cross-context RLS policies =====

--
-- Name: analytics_activity tenant_isolation; Type: POLICY; Schema: shared; Owner: -
--

CREATE POLICY tenant_isolation ON shared.analytics_activity TO space_app USING ((tenant_id = shared.require_tenant_id())) WITH CHECK ((tenant_id = shared.require_tenant_id()));


--
-- Name: analytics_events tenant_isolation; Type: POLICY; Schema: shared; Owner: -
--

CREATE POLICY tenant_isolation ON shared.analytics_events TO space_app USING ((tenant_id = shared.require_tenant_id())) WITH CHECK ((tenant_id = shared.require_tenant_id()));


--
-- Name: audit_exports tenant_isolation; Type: POLICY; Schema: shared; Owner: -
--

CREATE POLICY tenant_isolation ON shared.audit_exports TO space_app USING (((tenant_id = shared.current_tenant_id_or_null()) OR ((tenant_id IS NULL) AND (shared.current_tenant_id_or_null() IS NULL)))) WITH CHECK (((tenant_id = shared.current_tenant_id_or_null()) OR ((tenant_id IS NULL) AND (shared.current_tenant_id_or_null() IS NULL))));


--
-- Name: audit_log tenant_isolation; Type: POLICY; Schema: shared; Owner: -
--

CREATE POLICY tenant_isolation ON shared.audit_log TO space_app USING ((tenant_id = shared.require_tenant_id())) WITH CHECK ((tenant_id = shared.require_tenant_id()));


--
-- Name: POLICY tenant_isolation ON audit_log; Type: COMMENT; Schema: shared; Owner: -
--

COMMENT ON POLICY tenant_isolation ON shared.audit_log IS 'Tenant firewall：USING 限制旧行，WITH CHECK 限制新行；不替代 PermissionGuard';


--
-- Name: bundle_exports tenant_isolation; Type: POLICY; Schema: shared; Owner: -
--

CREATE POLICY tenant_isolation ON shared.bundle_exports TO space_app USING ((tenant_id = shared.require_tenant_id())) WITH CHECK ((tenant_id = shared.require_tenant_id()));


--
-- Name: deletion_records tenant_isolation; Type: POLICY; Schema: shared; Owner: -
--

CREATE POLICY tenant_isolation ON shared.deletion_records TO space_app USING ((tenant_id = shared.require_tenant_id())) WITH CHECK ((tenant_id = shared.require_tenant_id()));


--
-- Name: delivery_events tenant_isolation; Type: POLICY; Schema: shared; Owner: -
--

CREATE POLICY tenant_isolation ON shared.delivery_events TO space_app USING ((tenant_id = shared.require_tenant_id())) WITH CHECK ((tenant_id = shared.require_tenant_id()));


--
-- Name: delivery_publications tenant_isolation; Type: POLICY; Schema: shared; Owner: -
--

CREATE POLICY tenant_isolation ON shared.delivery_publications TO space_app USING ((tenant_id = shared.require_tenant_id())) WITH CHECK ((tenant_id = shared.require_tenant_id()));


--
-- Name: jobs tenant_isolation; Type: POLICY; Schema: shared; Owner: -
--

CREATE POLICY tenant_isolation ON shared.jobs TO space_app USING ((tenant_id = shared.require_tenant_id())) WITH CHECK ((tenant_id = shared.require_tenant_id()));


--
-- Name: POLICY tenant_isolation ON jobs; Type: COMMENT; Schema: shared; Owner: -
--

COMMENT ON POLICY tenant_isolation ON shared.jobs IS 'Tenant firewall：USING 限制旧行，WITH CHECK 限制新行；不替代 PermissionGuard';


--
-- Name: tenants tenant_isolation; Type: POLICY; Schema: shared; Owner: -
--

CREATE POLICY tenant_isolation ON shared.tenants TO space_app USING ((id = shared.require_tenant_id())) WITH CHECK ((id = shared.require_tenant_id()));


--
-- Name: POLICY tenant_isolation ON tenants; Type: COMMENT; Schema: shared; Owner: -
--

COMMENT ON POLICY tenant_isolation ON shared.tenants IS 'Tenant firewall：USING 限制旧行，WITH CHECK 限制新行；不替代 PermissionGuard';


--
-- Name: webhook_attempts tenant_isolation; Type: POLICY; Schema: shared; Owner: -
--

CREATE POLICY tenant_isolation ON shared.webhook_attempts TO space_app USING ((EXISTS ( SELECT 1
   FROM shared.webhook_deliveries d
  WHERE (d.id = webhook_attempts.delivery_id)))) WITH CHECK ((EXISTS ( SELECT 1
   FROM shared.webhook_deliveries d
  WHERE (d.id = webhook_attempts.delivery_id))));


--
-- Name: webhook_deliveries tenant_isolation; Type: POLICY; Schema: shared; Owner: -
--

CREATE POLICY tenant_isolation ON shared.webhook_deliveries TO space_app USING ((EXISTS ( SELECT 1
   FROM shared.webhooks webhook
  WHERE ((webhook.id = webhook_deliveries.webhook_id) AND (webhook.tenant_id = shared.require_tenant_id()))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM shared.webhooks webhook
  WHERE ((webhook.id = webhook_deliveries.webhook_id) AND (webhook.tenant_id = shared.require_tenant_id())))));


--
-- Name: POLICY tenant_isolation ON webhook_deliveries; Type: COMMENT; Schema: shared; Owner: -
--

COMMENT ON POLICY tenant_isolation ON shared.webhook_deliveries IS 'Tenant firewall：USING 限制旧行，WITH CHECK 限制新行；不替代 PermissionGuard';


--
-- Name: webhooks tenant_isolation; Type: POLICY; Schema: shared; Owner: -
--

CREATE POLICY tenant_isolation ON shared.webhooks TO space_app USING ((tenant_id = shared.require_tenant_id())) WITH CHECK ((tenant_id = shared.require_tenant_id()));


--
-- Name: POLICY tenant_isolation ON webhooks; Type: COMMENT; Schema: shared; Owner: -
--

COMMENT ON POLICY tenant_isolation ON shared.webhooks IS 'Tenant firewall：USING 限制旧行，WITH CHECK 限制新行；不替代 PermissionGuard';


--
-- Name: jobs tenant_write_consistency; Type: POLICY; Schema: shared; Owner: -
--

CREATE POLICY tenant_write_consistency ON shared.jobs AS RESTRICTIVE TO space_app USING (true) WITH CHECK (((space_id IS NULL) OR (EXISTS ( SELECT 1
   FROM authoring.spaces space
  WHERE ((space.id = jobs.space_id) AND (space.tenant_id = shared.require_tenant_id()))))));


--
-- Name: POLICY tenant_write_consistency ON jobs; Type: COMMENT; Schema: shared; Owner: -
--

COMMENT ON POLICY tenant_write_consistency ON shared.jobs IS 'Restrictive write check：SELECT/DELETE 仍按稳定 owner Tenant 可见，INSERT/UPDATE 校验可变 target';


--
-- Name: api_tokens tenant_isolation; Type: POLICY; Schema: iam; Owner: -
--

CREATE POLICY tenant_isolation ON iam.api_tokens TO space_app USING ((tenant_id = shared.require_tenant_id())) WITH CHECK ((tenant_id = shared.require_tenant_id()));


--
-- Name: POLICY tenant_isolation ON api_tokens; Type: COMMENT; Schema: iam; Owner: -
--

COMMENT ON POLICY tenant_isolation ON iam.api_tokens IS 'Tenant firewall：USING 限制旧行，WITH CHECK 限制新行；不替代 PermissionGuard';


--
-- Name: invites tenant_isolation; Type: POLICY; Schema: iam; Owner: -
--

CREATE POLICY tenant_isolation ON iam.invites TO space_app USING ((tenant_id = shared.require_tenant_id())) WITH CHECK ((tenant_id = shared.require_tenant_id()));


--
-- Name: POLICY tenant_isolation ON invites; Type: COMMENT; Schema: iam; Owner: -
--

COMMENT ON POLICY tenant_isolation ON iam.invites IS 'Tenant firewall：USING 限制旧行，WITH CHECK 限制新行；不替代 PermissionGuard';


--
-- Name: memberships tenant_isolation; Type: POLICY; Schema: iam; Owner: -
--

CREATE POLICY tenant_isolation ON iam.memberships TO space_app USING ((tenant_id = shared.require_tenant_id())) WITH CHECK ((tenant_id = shared.require_tenant_id()));


--
-- Name: POLICY tenant_isolation ON memberships; Type: COMMENT; Schema: iam; Owner: -
--

COMMENT ON POLICY tenant_isolation ON iam.memberships IS 'Tenant firewall：USING 限制旧行，WITH CHECK 限制新行；不替代 PermissionGuard';


--
-- Name: permission_grants tenant_isolation; Type: POLICY; Schema: iam; Owner: -
--

CREATE POLICY tenant_isolation ON iam.permission_grants TO space_app USING ((tenant_id = shared.require_tenant_id())) WITH CHECK ((tenant_id = shared.require_tenant_id()));


--
-- Name: POLICY tenant_isolation ON permission_grants; Type: COMMENT; Schema: iam; Owner: -
--

COMMENT ON POLICY tenant_isolation ON iam.permission_grants IS 'Tenant firewall：USING 限制旧行，WITH CHECK 限制新行；不替代 PermissionGuard';


--
-- Name: permission_restriction_scopes tenant_isolation; Type: POLICY; Schema: iam; Owner: -
--

CREATE POLICY tenant_isolation ON iam.permission_restriction_scopes TO space_app USING ((tenant_id = shared.require_tenant_id())) WITH CHECK ((tenant_id = shared.require_tenant_id()));


--
-- Name: POLICY tenant_isolation ON permission_restriction_scopes; Type: COMMENT; Schema: iam; Owner: -
--

COMMENT ON POLICY tenant_isolation ON iam.permission_restriction_scopes IS 'Tenant firewall：USING 限制旧行，WITH CHECK 限制新行；不替代 PermissionGuard';


--
-- Name: permission_restrictions tenant_isolation; Type: POLICY; Schema: iam; Owner: -
--

CREATE POLICY tenant_isolation ON iam.permission_restrictions TO space_app USING ((tenant_id = shared.require_tenant_id())) WITH CHECK ((tenant_id = shared.require_tenant_id()));


--
-- Name: POLICY tenant_isolation ON permission_restrictions; Type: COMMENT; Schema: iam; Owner: -
--

COMMENT ON POLICY tenant_isolation ON iam.permission_restrictions IS 'Tenant firewall：USING 限制旧行，WITH CHECK 限制新行；不替代 PermissionGuard';


--
-- Name: teams tenant_isolation; Type: POLICY; Schema: iam; Owner: -
--

CREATE POLICY tenant_isolation ON iam.teams TO space_app USING ((tenant_id = shared.require_tenant_id())) WITH CHECK ((tenant_id = shared.require_tenant_id()));


--
-- Name: POLICY tenant_isolation ON teams; Type: COMMENT; Schema: iam; Owner: -
--

COMMENT ON POLICY tenant_isolation ON iam.teams IS 'Tenant firewall：USING 限制旧行，WITH CHECK 限制新行；不替代 PermissionGuard';


--
-- Name: api_tokens tenant_write_consistency; Type: POLICY; Schema: iam; Owner: -
--

CREATE POLICY tenant_write_consistency ON iam.api_tokens AS RESTRICTIVE TO space_app USING (true) WITH CHECK ((EXISTS ( SELECT 1
   FROM authoring.spaces space
  WHERE ((space.id = api_tokens.space_id) AND (space.tenant_id = shared.require_tenant_id())))));


--
-- Name: POLICY tenant_write_consistency ON api_tokens; Type: COMMENT; Schema: iam; Owner: -
--

COMMENT ON POLICY tenant_write_consistency ON iam.api_tokens IS 'Restrictive write check：SELECT/DELETE 仍按稳定 owner Tenant 可见，INSERT/UPDATE 校验可变 target';


--
-- Name: invites tenant_write_consistency; Type: POLICY; Schema: iam; Owner: -
--

CREATE POLICY tenant_write_consistency ON iam.invites AS RESTRICTIVE TO space_app USING (true) WITH CHECK (shared.group_belongs_to_current_tenant(group_type, group_id));


--
-- Name: POLICY tenant_write_consistency ON invites; Type: COMMENT; Schema: iam; Owner: -
--

COMMENT ON POLICY tenant_write_consistency ON iam.invites IS 'Restrictive write check：SELECT/DELETE 仍按稳定 owner Tenant 可见，INSERT/UPDATE 校验可变 target';


--
-- Name: memberships tenant_write_consistency; Type: POLICY; Schema: iam; Owner: -
--

CREATE POLICY tenant_write_consistency ON iam.memberships AS RESTRICTIVE TO space_app USING (true) WITH CHECK (shared.group_belongs_to_current_tenant(group_type, group_id));


--
-- Name: POLICY tenant_write_consistency ON memberships; Type: COMMENT; Schema: iam; Owner: -
--

COMMENT ON POLICY tenant_write_consistency ON iam.memberships IS 'Restrictive write check：SELECT/DELETE 仍按稳定 owner Tenant 可见，INSERT/UPDATE 校验可变 target';


--
-- Name: permission_grants tenant_write_consistency; Type: POLICY; Schema: iam; Owner: -
--

CREATE POLICY tenant_write_consistency ON iam.permission_grants AS RESTRICTIVE TO space_app USING (true) WITH CHECK (shared.resource_belongs_to_current_tenant(resource_type, resource_id));


--
-- Name: POLICY tenant_write_consistency ON permission_grants; Type: COMMENT; Schema: iam; Owner: -
--

COMMENT ON POLICY tenant_write_consistency ON iam.permission_grants IS 'Restrictive write check：SELECT/DELETE 仍按稳定 owner Tenant 可见，INSERT/UPDATE 校验可变 target';


--
-- Name: permission_restriction_scopes tenant_write_consistency; Type: POLICY; Schema: iam; Owner: -
--

CREATE POLICY tenant_write_consistency ON iam.permission_restriction_scopes AS RESTRICTIVE TO space_app USING (true) WITH CHECK (shared.resource_belongs_to_current_tenant(resource_type, resource_id));


--
-- Name: POLICY tenant_write_consistency ON permission_restriction_scopes; Type: COMMENT; Schema: iam; Owner: -
--

COMMENT ON POLICY tenant_write_consistency ON iam.permission_restriction_scopes IS 'Restrictive write check：SELECT/DELETE 仍按稳定 owner Tenant 可见，INSERT/UPDATE 校验可变 target';


--
-- Name: permission_restrictions tenant_write_consistency; Type: POLICY; Schema: iam; Owner: -
--

CREATE POLICY tenant_write_consistency ON iam.permission_restrictions AS RESTRICTIVE TO space_app USING (true) WITH CHECK (shared.resource_belongs_to_current_tenant(resource_type, resource_id));


--
-- Name: POLICY tenant_write_consistency ON permission_restrictions; Type: COMMENT; Schema: iam; Owner: -
--

COMMENT ON POLICY tenant_write_consistency ON iam.permission_restrictions IS 'Restrictive write check：SELECT/DELETE 仍按稳定 owner Tenant 可见，INSERT/UPDATE 校验可变 target';


--
-- Name: attachments tenant_isolation; Type: POLICY; Schema: authoring; Owner: -
--

CREATE POLICY tenant_isolation ON authoring.attachments TO space_app USING ((EXISTS ( SELECT 1
   FROM authoring.pages page
  WHERE ((page.id = attachments.page_id) AND (page.tenant_id = shared.require_tenant_id()))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM authoring.pages page
  WHERE ((page.id = attachments.page_id) AND (page.tenant_id = shared.require_tenant_id())))));


--
-- Name: collection_spaces tenant_isolation; Type: POLICY; Schema: authoring; Owner: -
--

CREATE POLICY tenant_isolation ON authoring.collection_spaces TO space_app USING ((EXISTS ( SELECT 1
   FROM authoring.collections collection
  WHERE ((collection.id = collection_spaces.collection_id) AND (collection.tenant_id = shared.require_tenant_id()))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM authoring.collections collection
  WHERE ((collection.id = collection_spaces.collection_id) AND (collection.tenant_id = shared.require_tenant_id())))));


--
-- Name: POLICY tenant_isolation ON collection_spaces; Type: COMMENT; Schema: authoring; Owner: -
--

COMMENT ON POLICY tenant_isolation ON authoring.collection_spaces IS 'Tenant firewall：USING 限制旧行，WITH CHECK 限制新行；不替代 PermissionGuard';


--
-- Name: collections tenant_isolation; Type: POLICY; Schema: authoring; Owner: -
--

CREATE POLICY tenant_isolation ON authoring.collections TO space_app USING ((tenant_id = shared.require_tenant_id())) WITH CHECK ((tenant_id = shared.require_tenant_id()));


--
-- Name: POLICY tenant_isolation ON collections; Type: COMMENT; Schema: authoring; Owner: -
--

COMMENT ON POLICY tenant_isolation ON authoring.collections IS 'Tenant firewall：USING 限制旧行，WITH CHECK 限制新行；不替代 PermissionGuard';


--
-- Name: page_tags tenant_isolation; Type: POLICY; Schema: authoring; Owner: -
--

CREATE POLICY tenant_isolation ON authoring.page_tags TO space_app USING ((EXISTS ( SELECT 1
   FROM authoring.pages page
  WHERE ((page.id = page_tags.page_id) AND (page.tenant_id = shared.require_tenant_id()))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM authoring.pages page
  WHERE ((page.id = page_tags.page_id) AND (page.tenant_id = shared.require_tenant_id())))));


--
-- Name: pages tenant_isolation; Type: POLICY; Schema: authoring; Owner: -
--

CREATE POLICY tenant_isolation ON authoring.pages TO space_app USING ((tenant_id = shared.require_tenant_id())) WITH CHECK ((tenant_id = shared.require_tenant_id()));


--
-- Name: revisions tenant_isolation; Type: POLICY; Schema: authoring; Owner: -
--

CREATE POLICY tenant_isolation ON authoring.revisions TO space_app USING ((EXISTS ( SELECT 1
   FROM authoring.pages page
  WHERE ((page.id = revisions.page_id) AND (page.tenant_id = shared.require_tenant_id()))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM authoring.pages page
  WHERE ((page.id = revisions.page_id) AND (page.tenant_id = shared.require_tenant_id())))));


--
-- Name: space_page_placements tenant_isolation; Type: POLICY; Schema: authoring; Owner: -
--

CREATE POLICY tenant_isolation ON authoring.space_page_placements TO space_app USING ((EXISTS ( SELECT 1
   FROM authoring.spaces space
  WHERE ((space.id = space_page_placements.space_id) AND (space.tenant_id = shared.require_tenant_id()))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM authoring.spaces space
  WHERE ((space.id = space_page_placements.space_id) AND (space.tenant_id = shared.require_tenant_id())))));


--
-- Name: spaces tenant_isolation; Type: POLICY; Schema: authoring; Owner: -
--

CREATE POLICY tenant_isolation ON authoring.spaces TO space_app USING ((tenant_id = shared.require_tenant_id())) WITH CHECK ((tenant_id = shared.require_tenant_id()));


--
-- Name: POLICY tenant_isolation ON spaces; Type: COMMENT; Schema: authoring; Owner: -
--

COMMENT ON POLICY tenant_isolation ON authoring.spaces IS 'Tenant firewall：USING 限制旧行，WITH CHECK 限制新行；不替代 PermissionGuard';


--
-- Name: toc_entries tenant_isolation; Type: POLICY; Schema: authoring; Owner: -
--

CREATE POLICY tenant_isolation ON authoring.toc_entries TO space_app USING ((EXISTS ( SELECT 1
   FROM authoring.spaces space
  WHERE ((space.id = toc_entries.space_id) AND (space.tenant_id = shared.require_tenant_id()))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM authoring.spaces space
  WHERE ((space.id = toc_entries.space_id) AND (space.tenant_id = shared.require_tenant_id())))));


--
-- Name: POLICY tenant_isolation ON toc_entries; Type: COMMENT; Schema: authoring; Owner: -
--

COMMENT ON POLICY tenant_isolation ON authoring.toc_entries IS 'Tenant firewall：USING 限制旧行，WITH CHECK 限制新行；不替代 PermissionGuard';


--
-- Name: collection_spaces tenant_write_consistency; Type: POLICY; Schema: authoring; Owner: -
--

CREATE POLICY tenant_write_consistency ON authoring.collection_spaces AS RESTRICTIVE TO space_app USING (true) WITH CHECK ((EXISTS ( SELECT 1
   FROM authoring.spaces space
  WHERE ((space.id = collection_spaces.space_id) AND (space.tenant_id = shared.require_tenant_id())))));


--
-- Name: POLICY tenant_write_consistency ON collection_spaces; Type: COMMENT; Schema: authoring; Owner: -
--

COMMENT ON POLICY tenant_write_consistency ON authoring.collection_spaces IS 'Restrictive write check：SELECT/DELETE 仍按稳定 owner Tenant 可见，INSERT/UPDATE 校验可变 target';


--
-- Name: space_page_placements tenant_write_consistency; Type: POLICY; Schema: authoring; Owner: -
--

CREATE POLICY tenant_write_consistency ON authoring.space_page_placements AS RESTRICTIVE TO space_app USING (true) WITH CHECK ((EXISTS ( SELECT 1
   FROM authoring.pages page
  WHERE ((page.id = space_page_placements.page_id) AND (page.tenant_id = shared.require_tenant_id())))));


--
-- Name: release_contents tenant_isolation; Type: POLICY; Schema: releases; Owner: -
--

CREATE POLICY tenant_isolation ON releases.release_contents TO space_app USING ((tenant_id = shared.require_tenant_id())) WITH CHECK ((tenant_id = shared.require_tenant_id()));


--
-- Name: POLICY tenant_isolation ON release_contents; Type: COMMENT; Schema: releases; Owner: -
--

COMMENT ON POLICY tenant_isolation ON releases.release_contents IS 'Tenant firewall：USING 限制旧行，WITH CHECK 限制新行；不替代 PermissionGuard';


--
-- Name: release_pages tenant_isolation; Type: POLICY; Schema: releases; Owner: -
--

CREATE POLICY tenant_isolation ON releases.release_pages TO space_app USING ((tenant_id = shared.require_tenant_id())) WITH CHECK ((tenant_id = shared.require_tenant_id()));


--
-- Name: POLICY tenant_isolation ON release_pages; Type: COMMENT; Schema: releases; Owner: -
--

COMMENT ON POLICY tenant_isolation ON releases.release_pages IS 'Tenant firewall：USING 限制旧行，WITH CHECK 限制新行；不替代 PermissionGuard';


--
-- Name: release_pins tenant_isolation; Type: POLICY; Schema: releases; Owner: -
--

CREATE POLICY tenant_isolation ON releases.release_pins TO space_app USING ((tenant_id = shared.require_tenant_id())) WITH CHECK (((tenant_id = shared.require_tenant_id()) AND (EXISTS ( SELECT 1
   FROM releases.releases r
  WHERE (r.id = release_pins.release_id)))));


--
-- Name: release_retention tenant_isolation; Type: POLICY; Schema: releases; Owner: -
--

CREATE POLICY tenant_isolation ON releases.release_retention TO space_app USING ((EXISTS ( SELECT 1
   FROM authoring.spaces space
  WHERE ((space.id = release_retention.space_id) AND (space.tenant_id = shared.require_tenant_id()))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM authoring.spaces space
  WHERE ((space.id = release_retention.space_id) AND (space.tenant_id = shared.require_tenant_id())))));


--
-- Name: POLICY tenant_isolation ON release_retention; Type: COMMENT; Schema: releases; Owner: -
--

COMMENT ON POLICY tenant_isolation ON releases.release_retention IS 'Tenant firewall：USING 限制旧行，WITH CHECK 限制新行；不替代 PermissionGuard';


--
-- Name: release_toc tenant_isolation; Type: POLICY; Schema: releases; Owner: -
--

CREATE POLICY tenant_isolation ON releases.release_toc TO space_app USING ((EXISTS ( SELECT 1
   FROM (releases.releases release
     JOIN authoring.spaces space ON ((space.id = release.space_id)))
  WHERE ((release.id = release_toc.release_id) AND (space.tenant_id = shared.require_tenant_id()))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM (releases.releases release
     JOIN authoring.spaces space ON ((space.id = release.space_id)))
  WHERE ((release.id = release_toc.release_id) AND (space.tenant_id = shared.require_tenant_id())))));


--
-- Name: POLICY tenant_isolation ON release_toc; Type: COMMENT; Schema: releases; Owner: -
--

COMMENT ON POLICY tenant_isolation ON releases.release_toc IS 'Tenant firewall：USING 限制旧行，WITH CHECK 限制新行；不替代 PermissionGuard';


--
-- Name: releases tenant_isolation; Type: POLICY; Schema: releases; Owner: -
--

CREATE POLICY tenant_isolation ON releases.releases TO space_app USING ((EXISTS ( SELECT 1
   FROM authoring.spaces space
  WHERE ((space.id = releases.space_id) AND (space.tenant_id = shared.require_tenant_id()))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM authoring.spaces space
  WHERE ((space.id = releases.space_id) AND (space.tenant_id = shared.require_tenant_id())))));


--
-- Name: POLICY tenant_isolation ON releases; Type: COMMENT; Schema: releases; Owner: -
--

COMMENT ON POLICY tenant_isolation ON releases.releases IS 'Tenant firewall：USING 限制旧行，WITH CHECK 限制新行；不替代 PermissionGuard';


--
-- Name: custom_domains tenant_isolation; Type: POLICY; Schema: hosting; Owner: -
--

CREATE POLICY tenant_isolation ON hosting.custom_domains TO space_app USING ((EXISTS ( SELECT 1
   FROM hosting.sites site
  WHERE ((site.id = custom_domains.site_id) AND (site.tenant_id = shared.require_tenant_id()))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM hosting.sites site
  WHERE ((site.id = custom_domains.site_id) AND (site.tenant_id = shared.require_tenant_id())))));


--
-- Name: POLICY tenant_isolation ON custom_domains; Type: COMMENT; Schema: hosting; Owner: -
--

COMMENT ON POLICY tenant_isolation ON hosting.custom_domains IS 'Tenant firewall：USING 限制旧行，WITH CHECK 限制新行；不替代 PermissionGuard';


--
-- Name: redirects tenant_isolation; Type: POLICY; Schema: hosting; Owner: -
--

CREATE POLICY tenant_isolation ON hosting.redirects TO space_app USING ((EXISTS ( SELECT 1
   FROM hosting.sites site
  WHERE ((site.id = redirects.site_id) AND (site.tenant_id = shared.require_tenant_id()))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM hosting.sites site
  WHERE ((site.id = redirects.site_id) AND (site.tenant_id = shared.require_tenant_id())))));


--
-- Name: POLICY tenant_isolation ON redirects; Type: COMMENT; Schema: hosting; Owner: -
--

COMMENT ON POLICY tenant_isolation ON hosting.redirects IS 'Tenant firewall：USING 限制旧行，WITH CHECK 限制新行；不替代 PermissionGuard';


--
-- Name: search_settings tenant_isolation; Type: POLICY; Schema: hosting; Owner: -
--

CREATE POLICY tenant_isolation ON hosting.search_settings TO space_app USING ((tenant_id = shared.require_tenant_id())) WITH CHECK ((tenant_id = shared.require_tenant_id()));


--
-- Name: site_mounts tenant_isolation; Type: POLICY; Schema: hosting; Owner: -
--

CREATE POLICY tenant_isolation ON hosting.site_mounts TO space_app USING ((EXISTS ( SELECT 1
   FROM hosting.sites site
  WHERE ((site.id = site_mounts.site_id) AND (site.tenant_id = shared.require_tenant_id()))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM hosting.sites site
  WHERE ((site.id = site_mounts.site_id) AND (site.tenant_id = shared.require_tenant_id())))));


--
-- Name: POLICY tenant_isolation ON site_mounts; Type: COMMENT; Schema: hosting; Owner: -
--

COMMENT ON POLICY tenant_isolation ON hosting.site_mounts IS 'Tenant firewall：USING 限制旧行，WITH CHECK 限制新行；不替代 PermissionGuard';


--
-- Name: sites tenant_isolation; Type: POLICY; Schema: hosting; Owner: -
--

CREATE POLICY tenant_isolation ON hosting.sites TO space_app USING ((tenant_id = shared.require_tenant_id())) WITH CHECK ((tenant_id = shared.require_tenant_id()));


--
-- Name: POLICY tenant_isolation ON sites; Type: COMMENT; Schema: hosting; Owner: -
--

COMMENT ON POLICY tenant_isolation ON hosting.sites IS 'Tenant firewall：USING 限制旧行，WITH CHECK 限制新行；不替代 PermissionGuard';


--
-- Name: redirects tenant_write_consistency; Type: POLICY; Schema: hosting; Owner: -
--

CREATE POLICY tenant_write_consistency ON hosting.redirects AS RESTRICTIVE TO space_app USING (true) WITH CHECK (shared.resource_belongs_to_current_tenant(target_type, target_id));


--
-- Name: POLICY tenant_write_consistency ON redirects; Type: COMMENT; Schema: hosting; Owner: -
--

COMMENT ON POLICY tenant_write_consistency ON hosting.redirects IS 'Restrictive write check：SELECT/DELETE 仍按稳定 owner Tenant 可见，INSERT/UPDATE 校验可变 target';


--
-- Name: site_mounts tenant_write_consistency; Type: POLICY; Schema: hosting; Owner: -
--

CREATE POLICY tenant_write_consistency ON hosting.site_mounts AS RESTRICTIVE TO space_app USING (true) WITH CHECK ((EXISTS ( SELECT 1
   FROM authoring.spaces space
  WHERE ((space.id = site_mounts.space_id) AND (space.tenant_id = shared.require_tenant_id())))));


--
-- Name: POLICY tenant_write_consistency ON site_mounts; Type: COMMENT; Schema: hosting; Owner: -
--

COMMENT ON POLICY tenant_write_consistency ON hosting.site_mounts IS 'Restrictive write check：SELECT/DELETE 仍按稳定 owner Tenant 可见，INSERT/UPDATE 校验可变 target';
