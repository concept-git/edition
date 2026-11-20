-- ===== context: releases release snapshots =====
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
-- Name: releases; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA IF NOT EXISTS releases;


SET default_tablespace = '';

SET default_table_access_method = heap;

-- ===== concepts: releases release and immutable snapshot state =====
--
-- Name: release_contents; Type: TABLE; Schema: releases; Owner: -
--

CREATE TABLE releases.release_contents (
    tenant_id uuid NOT NULL,
    content_hash text NOT NULL,
    body text NOT NULL
);

ALTER TABLE ONLY releases.release_contents FORCE ROW LEVEL SECURITY;


--
-- Name: TABLE release_contents; Type: COMMENT; Schema: releases; Owner: -
--

COMMENT ON TABLE releases.release_contents IS 'rls:tenant/direct-context-stamp; 快照内容体，去重按租户分区（ADR-0008，不可变）';


--
-- Name: release_pages; Type: TABLE; Schema: releases; Owner: -
--

CREATE TABLE releases.release_pages (
    tenant_id uuid NOT NULL,
    release_id uuid NOT NULL,
    page_id uuid NOT NULL,
    slug text NOT NULL,
    title text NOT NULL,
    format text NOT NULL,
    seo jsonb,
    icon text,
    properties jsonb,
    external_id text,
    attachments jsonb,
    content_hash text NOT NULL,
    seq integer NOT NULL,
    CONSTRAINT release_pages_format_check CHECK ((format = ANY (ARRAY['markdown'::text, 'html'::text, 'txt'::text, 'json'::text, 'xml'::text])))
);

ALTER TABLE ONLY releases.release_pages FORCE ROW LEVEL SECURITY;


--
-- Name: TABLE release_pages; Type: COMMENT; Schema: releases; Owner: -
--

COMMENT ON TABLE releases.release_pages IS 'rls:tenant/direct-context-stamp; 快照页行（ADR-0008，不可变）';


--
-- Name: release_pins; Type: TABLE; Schema: releases; Owner: -
--

CREATE TABLE releases.release_pins (
    tenant_id uuid DEFAULT shared.require_tenant_id() NOT NULL,
    reservation uuid NOT NULL,
    release_id uuid NOT NULL,
    expires_at timestamp with time zone NOT NULL
);

ALTER TABLE ONLY releases.release_pins FORCE ROW LEVEL SECURITY;


--
-- Name: TABLE release_pins; Type: COMMENT; Schema: releases; Owner: -
--

COMMENT ON TABLE releases.release_pins IS 'rls:tenant/direct-context-stamp; bounded snapshot reservation owned by Release';


--
-- Name: release_retention; Type: TABLE; Schema: releases; Owner: -
--

CREATE TABLE releases.release_retention (
    space_id uuid NOT NULL,
    keep integer DEFAULT 7 NOT NULL,
    CONSTRAINT release_retention_keep_check CHECK ((keep >= 1))
);

ALTER TABLE ONLY releases.release_retention FORCE ROW LEVEL SECURITY;


--
-- Name: TABLE release_retention; Type: COMMENT; Schema: releases; Owner: -
--

COMMENT ON TABLE releases.release_retention IS 'rls:tenant/via-space; Retention 唯一属于 Space';


--
-- Name: release_toc; Type: TABLE; Schema: releases; Owner: -
--

CREATE TABLE releases.release_toc (
    release_id uuid NOT NULL,
    tree jsonb NOT NULL
);

ALTER TABLE ONLY releases.release_toc FORCE ROW LEVEL SECURITY;


--
-- Name: TABLE release_toc; Type: COMMENT; Schema: releases; Owner: -
--

COMMENT ON TABLE releases.release_toc IS 'rls:tenant/via-release; 快照编排唯一属于 Release（ADR-0008，不可变）';


--
-- Name: releases; Type: TABLE; Schema: releases; Owner: -
--

CREATE TABLE releases.releases (
    id uuid DEFAULT uuidv7() NOT NULL,
    space_id uuid NOT NULL,
    status text DEFAULT 'draft'::text NOT NULL,
    label text NOT NULL,
    notes text,
    source_kind text NOT NULL,
    source_ref text,
    source_actor_id uuid,
    source_zip_key text,
    page_count integer,
    report jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    promoted_at timestamp with time zone,
    bundle_version text,
    generator text,
    generated_at timestamp with time zone,
    CONSTRAINT releases_source_kind_check CHECK ((source_kind = ANY (ARRAY['import'::text, 'build'::text]))),
    CONSTRAINT releases_status_check CHECK ((status = ANY (ARRAY['draft'::text, 'flagged'::text, 'validated'::text, 'live'::text, 'archived'::text])))
);

ALTER TABLE ONLY releases.releases FORCE ROW LEVEL SECURITY;


--
-- Name: TABLE releases; Type: COMMENT; Schema: releases; Owner: -
--

COMMENT ON TABLE releases.releases IS 'rls:tenant/via-space; Release 唯一属于 Space';


-- ===== capability: publishing integrity and tenant firewall =====
--
-- Name: release_contents release_contents_pkey; Type: CONSTRAINT; Schema: releases; Owner: -
--

ALTER TABLE ONLY releases.release_contents
    ADD CONSTRAINT release_contents_pkey PRIMARY KEY (tenant_id, content_hash);


--
-- Name: release_pages release_pages_pkey; Type: CONSTRAINT; Schema: releases; Owner: -
--

ALTER TABLE ONLY releases.release_pages
    ADD CONSTRAINT release_pages_pkey PRIMARY KEY (release_id, page_id);


--
-- Draft snapshots preserve conflicting slugs so Release.validate can return slug_conflict.
-- Only validated snapshots may be promoted; page identity remains (release_id, page_id).
--



--
-- Name: release_pins release_pins_pkey; Type: CONSTRAINT; Schema: releases; Owner: -
--

ALTER TABLE ONLY releases.release_pins
    ADD CONSTRAINT release_pins_pkey PRIMARY KEY (reservation);


--
-- Name: release_retention release_retention_pkey; Type: CONSTRAINT; Schema: releases; Owner: -
--

ALTER TABLE ONLY releases.release_retention
    ADD CONSTRAINT release_retention_pkey PRIMARY KEY (space_id);


--
-- Name: release_toc release_toc_pkey; Type: CONSTRAINT; Schema: releases; Owner: -
--

ALTER TABLE ONLY releases.release_toc
    ADD CONSTRAINT release_toc_pkey PRIMARY KEY (release_id);


--
-- Name: releases releases_pkey; Type: CONSTRAINT; Schema: releases; Owner: -
--

ALTER TABLE ONLY releases.releases
    ADD CONSTRAINT releases_pkey PRIMARY KEY (id);


--
-- Name: release_pins_release; Type: INDEX; Schema: releases; Owner: -
--

CREATE INDEX release_pins_release ON releases.release_pins USING btree (release_id, expires_at);


--
-- Name: releases_one_live_per_space; Type: INDEX; Schema: releases; Owner: -
--

CREATE UNIQUE INDEX releases_one_live_per_space ON releases.releases USING btree (space_id) WHERE (status = 'live'::text);


--
-- Name: releases_space_id_created_at_idx; Type: INDEX; Schema: releases; Owner: -
--

CREATE INDEX releases_space_id_created_at_idx ON releases.releases USING btree (space_id, created_at DESC);


--
-- Name: release_contents forbid_update; Type: TRIGGER; Schema: releases; Owner: -
--

CREATE TRIGGER forbid_update BEFORE UPDATE ON releases.release_contents FOR EACH ROW EXECUTE FUNCTION shared.forbid_update();


--
-- Name: release_pages forbid_update; Type: TRIGGER; Schema: releases; Owner: -
--

CREATE TRIGGER forbid_update BEFORE UPDATE ON releases.release_pages FOR EACH ROW EXECUTE FUNCTION shared.forbid_update();


--
-- Name: release_toc forbid_update; Type: TRIGGER; Schema: releases; Owner: -
--

CREATE TRIGGER forbid_update BEFORE UPDATE ON releases.release_toc FOR EACH ROW EXECUTE FUNCTION shared.forbid_update();


--
-- Name: release_contents release_contents_tenant_id_fkey; Type: FK CONSTRAINT; Schema: releases; Owner: -
--

ALTER TABLE ONLY releases.release_contents
    ADD CONSTRAINT release_contents_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES shared.tenants(id);


--
-- Name: release_pages release_pages_release_id_fkey; Type: FK CONSTRAINT; Schema: releases; Owner: -
--

ALTER TABLE ONLY releases.release_pages
    ADD CONSTRAINT release_pages_release_id_fkey FOREIGN KEY (release_id) REFERENCES releases.releases(id) ON DELETE CASCADE;


--
-- Name: release_pages release_pages_tenant_id_content_hash_fkey; Type: FK CONSTRAINT; Schema: releases; Owner: -
--

ALTER TABLE ONLY releases.release_pages
    ADD CONSTRAINT release_pages_tenant_id_content_hash_fkey FOREIGN KEY (tenant_id, content_hash) REFERENCES releases.release_contents(tenant_id, content_hash);


--
-- Name: release_pages release_pages_tenant_id_fkey; Type: FK CONSTRAINT; Schema: releases; Owner: -
--

ALTER TABLE ONLY releases.release_pages
    ADD CONSTRAINT release_pages_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES shared.tenants(id);


--
-- Name: release_pins release_pins_release_id_fkey; Type: FK CONSTRAINT; Schema: releases; Owner: -
--

ALTER TABLE ONLY releases.release_pins
    ADD CONSTRAINT release_pins_release_id_fkey FOREIGN KEY (release_id) REFERENCES releases.releases(id) ON DELETE CASCADE;


--
-- Name: release_retention release_retention_space_id_fkey; Type: FK CONSTRAINT; Schema: releases; Owner: -
--

ALTER TABLE ONLY releases.release_retention
    ADD CONSTRAINT release_retention_space_id_fkey FOREIGN KEY (space_id) REFERENCES authoring.spaces(id);


--
-- Name: release_toc release_toc_release_id_fkey; Type: FK CONSTRAINT; Schema: releases; Owner: -
--

ALTER TABLE ONLY releases.release_toc
    ADD CONSTRAINT release_toc_release_id_fkey FOREIGN KEY (release_id) REFERENCES releases.releases(id) ON DELETE CASCADE;


--
-- Name: releases releases_space_id_fkey; Type: FK CONSTRAINT; Schema: releases; Owner: -
--

ALTER TABLE ONLY releases.releases
    ADD CONSTRAINT releases_space_id_fkey FOREIGN KEY (space_id) REFERENCES authoring.spaces(id);


--
-- Name: release_contents; Type: ROW SECURITY; Schema: releases; Owner: -
--

ALTER TABLE releases.release_contents ENABLE ROW LEVEL SECURITY;

--
-- Name: release_pages; Type: ROW SECURITY; Schema: releases; Owner: -
--

ALTER TABLE releases.release_pages ENABLE ROW LEVEL SECURITY;

--
-- Name: release_pins; Type: ROW SECURITY; Schema: releases; Owner: -
--

ALTER TABLE releases.release_pins ENABLE ROW LEVEL SECURITY;

--
-- Name: release_retention; Type: ROW SECURITY; Schema: releases; Owner: -
--

ALTER TABLE releases.release_retention ENABLE ROW LEVEL SECURITY;

--
-- Name: release_toc; Type: ROW SECURITY; Schema: releases; Owner: -
--

ALTER TABLE releases.release_toc ENABLE ROW LEVEL SECURITY;

--
-- Name: releases; Type: ROW SECURITY; Schema: releases; Owner: -
--

ALTER TABLE releases.releases ENABLE ROW LEVEL SECURITY;

--
-- Name: SCHEMA releases; Type: ACL; Schema: -; Owner: -
--

GRANT USAGE ON SCHEMA releases TO space_app;


--
-- Name: TABLE release_contents; Type: ACL; Schema: releases; Owner: -
--

GRANT SELECT,INSERT,DELETE ON TABLE releases.release_contents TO space_app;


--
-- Name: TABLE release_pages; Type: ACL; Schema: releases; Owner: -
--

GRANT SELECT,INSERT,DELETE ON TABLE releases.release_pages TO space_app;


--
-- Name: TABLE release_pins; Type: ACL; Schema: releases; Owner: -
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE releases.release_pins TO space_app;


--
-- Name: TABLE release_retention; Type: ACL; Schema: releases; Owner: -
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE releases.release_retention TO space_app;


--
-- Name: TABLE release_toc; Type: ACL; Schema: releases; Owner: -
--

GRANT SELECT,INSERT,DELETE ON TABLE releases.release_toc TO space_app;


--
-- Name: TABLE releases; Type: ACL; Schema: releases; Owner: -
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE releases.releases TO space_app;


--
-- PostgreSQL database dump complete
--
