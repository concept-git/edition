-- ===== context: authoring space, page and organization =====
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
-- Name: authoring; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA IF NOT EXISTS authoring;


SET default_tablespace = '';

SET default_table_access_method = heap;

-- ===== concepts: authoring space, page and organization state =====
--
-- Name: attachments; Type: TABLE; Schema: authoring; Owner: -
--

CREATE TABLE authoring.attachments (
    id uuid DEFAULT uuidv7() NOT NULL,
    page_id uuid NOT NULL,
    filename text NOT NULL,
    mime text NOT NULL,
    size_bytes bigint NOT NULL,
    storage_key text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    created_by uuid
);

ALTER TABLE ONLY authoring.attachments FORCE ROW LEVEL SECURITY;


--
-- Name: TABLE attachments; Type: COMMENT; Schema: authoring; Owner: -
--

COMMENT ON TABLE authoring.attachments IS 'rls:tenant/via-page; Attachment 唯一属于 Page';


--
-- Name: collection_spaces; Type: TABLE; Schema: authoring; Owner: -
--

CREATE TABLE authoring.collection_spaces (
    space_id uuid NOT NULL,
    collection_id uuid NOT NULL,
    "position" integer DEFAULT 0 NOT NULL
);

ALTER TABLE ONLY authoring.collection_spaces FORCE ROW LEVEL SECURITY;


--
-- Name: TABLE collection_spaces; Type: COMMENT; Schema: authoring; Owner: -
--

COMMENT ON TABLE authoring.collection_spaces IS 'rls:tenant/via-collection; Space 写入另校验';


--
-- Name: COLUMN collection_spaces."position"; Type: COMMENT; Schema: authoring; Owner: -
--

COMMENT ON COLUMN authoring.collection_spaces."position" IS '组内空间人工序，稠密 0..n-1';


--
-- Name: collections; Type: TABLE; Schema: authoring; Owner: -
--

CREATE TABLE authoring.collections (
    id uuid DEFAULT uuidv7() NOT NULL,
    tenant_id uuid NOT NULL,
    parent_id uuid,
    name text NOT NULL,
    icon text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    "position" integer DEFAULT 0 NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE ONLY authoring.collections FORCE ROW LEVEL SECURITY;


--
-- Name: TABLE collections; Type: COMMENT; Schema: authoring; Owner: -
--

COMMENT ON TABLE authoring.collections IS 'rls:tenant/direct; Collection 直接属于 Tenant';


--
-- Name: COLUMN collections."position"; Type: COMMENT; Schema: authoring; Owner: -
--

COMMENT ON COLUMN authoring.collections."position" IS '同父人工序，稠密 0..n-1';


--
-- Name: page_tags; Type: TABLE; Schema: authoring; Owner: -
--

CREATE TABLE authoring.page_tags (
    page_id uuid NOT NULL,
    label text NOT NULL
);

ALTER TABLE ONLY authoring.page_tags FORCE ROW LEVEL SECURITY;


--
-- Name: TABLE page_tags; Type: COMMENT; Schema: authoring; Owner: -
--

COMMENT ON TABLE authoring.page_tags IS 'rls:tenant/via-page; Tag 唯一属于 Page';


--
-- Name: pages; Type: TABLE; Schema: authoring; Owner: -
--

CREATE TABLE authoring.pages (
    id uuid DEFAULT uuidv7() NOT NULL,
    title text NOT NULL,
    format text NOT NULL,
    content text DEFAULT ''::text NOT NULL,
    status text DEFAULT 'draft'::text NOT NULL,
    seo_title text,
    seo_description text,
    seo_keywords text,
    og_image_url text,
    no_index boolean DEFAULT false NOT NULL,
    icon text,
    properties jsonb DEFAULT '{}'::jsonb NOT NULL,
    trashed_at timestamp with time zone,
    external_id text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    created_by uuid,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_by uuid,
    tenant_id uuid NOT NULL,
    revision integer DEFAULT 0 NOT NULL,
    created_by_type text NOT NULL,
    updated_by_type text NOT NULL,
    CONSTRAINT pages_created_actor_check CHECK ((((created_by_type = 'system'::text) AND (created_by IS NULL)) OR ((created_by_type = ANY (ARRAY['user'::text, 'api_token'::text])) AND (created_by IS NOT NULL)))),
    CONSTRAINT pages_format_check CHECK ((format = ANY (ARRAY['markdown'::text, 'html'::text, 'txt'::text, 'json'::text, 'xml'::text]))),
    CONSTRAINT pages_status_check CHECK ((status = ANY (ARRAY['draft'::text, 'published'::text]))),
    CONSTRAINT pages_updated_actor_check CHECK ((((updated_by_type = 'system'::text) AND (updated_by IS NULL)) OR ((updated_by_type = ANY (ARRAY['user'::text, 'api_token'::text])) AND (updated_by IS NOT NULL))))
);

ALTER TABLE ONLY authoring.pages FORCE ROW LEVEL SECURITY;


--
-- Name: TABLE pages; Type: COMMENT; Schema: authoring; Owner: -
--

COMMENT ON TABLE authoring.pages IS 'rls:tenant/direct-context-stamp; Page content state; membership belongs to Space placement';


--
-- Name: revisions; Type: TABLE; Schema: authoring; Owner: -
--

CREATE TABLE authoring.revisions (
    id bigint NOT NULL,
    page_id uuid NOT NULL,
    n integer NOT NULL,
    content text NOT NULL,
    content_sha text NOT NULL,
    author_id uuid,
    note text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    actor_type text NOT NULL,
    CONSTRAINT revisions_actor_check CHECK ((((actor_type = 'system'::text) AND (author_id IS NULL)) OR ((actor_type = ANY (ARRAY['user'::text, 'api_token'::text])) AND (author_id IS NOT NULL))))
);

ALTER TABLE ONLY authoring.revisions FORCE ROW LEVEL SECURITY;


--
-- Name: TABLE revisions; Type: COMMENT; Schema: authoring; Owner: -
--

COMMENT ON TABLE authoring.revisions IS 'rls:tenant/via-page; Revision 唯一属于 Page';


--
-- Name: revisions_id_seq; Type: SEQUENCE; Schema: authoring; Owner: -
--

ALTER TABLE authoring.revisions ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME authoring.revisions_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: space_page_placements; Type: TABLE; Schema: authoring; Owner: -
--

CREATE TABLE authoring.space_page_placements (
    space_id uuid NOT NULL,
    page_id uuid NOT NULL,
    slug text NOT NULL
);

ALTER TABLE ONLY authoring.space_page_placements FORCE ROW LEVEL SECURITY;


--
-- Name: TABLE space_page_placements; Type: COMMENT; Schema: authoring; Owner: -
--

COMMENT ON TABLE authoring.space_page_placements IS 'rls:tenant/via-space; Space owns Page membership and normalized slug';


--
-- Name: spaces; Type: TABLE; Schema: authoring; Owner: -
--

CREATE TABLE authoring.spaces (
    id uuid DEFAULT uuidv7() NOT NULL,
    tenant_id uuid NOT NULL,
    name text NOT NULL,
    icon text,
    description text,
    mode text NOT NULL,
    auto_release boolean DEFAULT true NOT NULL,
    status text DEFAULT 'active'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    created_by uuid,
    updated_by uuid,
    CONSTRAINT spaces_icon_key_check CHECK (((icon IS NULL) OR (icon = ANY (ARRAY['book'::text, 'code'::text, 'api'::text, 'guide'::text, 'reference'::text])))),
    CONSTRAINT spaces_mode_check CHECK ((mode = ANY (ARRAY['authored'::text, 'synced'::text]))),
    CONSTRAINT spaces_status_check CHECK ((status = ANY (ARRAY['active'::text, 'archived'::text])))
);

ALTER TABLE ONLY authoring.spaces FORCE ROW LEVEL SECURITY;


--
-- Name: TABLE spaces; Type: COMMENT; Schema: authoring; Owner: -
--

COMMENT ON TABLE authoring.spaces IS 'rls:tenant/direct; Space 根资源';


--
-- Name: toc_entries; Type: TABLE; Schema: authoring; Owner: -
--

CREATE TABLE authoring.toc_entries (
    id uuid DEFAULT uuidv7() NOT NULL,
    space_id uuid NOT NULL,
    parent_id uuid,
    "position" integer NOT NULL,
    label text NOT NULL,
    kind text NOT NULL,
    target_page_id uuid,
    url text,
    CONSTRAINT toc_entries_check CHECK (((kind = 'target'::text) = (target_page_id IS NOT NULL))),
    CONSTRAINT toc_entries_check1 CHECK (((kind = 'link'::text) = (url IS NOT NULL))),
    CONSTRAINT toc_entries_kind_check CHECK ((kind = ANY (ARRAY['target'::text, 'group'::text, 'link'::text])))
);

ALTER TABLE ONLY authoring.toc_entries FORCE ROW LEVEL SECURITY;


--
-- Name: TABLE toc_entries; Type: COMMENT; Schema: authoring; Owner: -
--

COMMENT ON TABLE authoring.toc_entries IS 'rls:tenant/via-space; Toc 唯一属于 Space';


-- ===== capability: authoring integrity and tenant firewall =====
--
-- Name: attachments attachments_pkey; Type: CONSTRAINT; Schema: authoring; Owner: -
--

ALTER TABLE ONLY authoring.attachments
    ADD CONSTRAINT attachments_pkey PRIMARY KEY (id);


--
-- Name: collection_spaces collection_spaces_pkey; Type: CONSTRAINT; Schema: authoring; Owner: -
--

ALTER TABLE ONLY authoring.collection_spaces
    ADD CONSTRAINT collection_spaces_pkey PRIMARY KEY (space_id);


--
-- Name: collections collections_pkey; Type: CONSTRAINT; Schema: authoring; Owner: -
--

ALTER TABLE ONLY authoring.collections
    ADD CONSTRAINT collections_pkey PRIMARY KEY (id);


--
-- Name: collections collections_tenant_id_id_key; Type: CONSTRAINT; Schema: authoring; Owner: -
--

ALTER TABLE ONLY authoring.collections
    ADD CONSTRAINT collections_tenant_id_id_key UNIQUE (tenant_id, id);


--
-- Name: page_tags page_tags_pkey; Type: CONSTRAINT; Schema: authoring; Owner: -
--

ALTER TABLE ONLY authoring.page_tags
    ADD CONSTRAINT page_tags_pkey PRIMARY KEY (page_id, label);


--
-- Name: pages pages_pkey; Type: CONSTRAINT; Schema: authoring; Owner: -
--

ALTER TABLE ONLY authoring.pages
    ADD CONSTRAINT pages_pkey PRIMARY KEY (id);


--
-- Name: revisions revisions_page_id_n_key; Type: CONSTRAINT; Schema: authoring; Owner: -
--

ALTER TABLE ONLY authoring.revisions
    ADD CONSTRAINT revisions_page_id_n_key UNIQUE (page_id, n);


--
-- Name: revisions revisions_pkey; Type: CONSTRAINT; Schema: authoring; Owner: -
--

ALTER TABLE ONLY authoring.revisions
    ADD CONSTRAINT revisions_pkey PRIMARY KEY (id);


--
-- Name: space_page_placements space_page_placements_page_id_key; Type: CONSTRAINT; Schema: authoring; Owner: -
--

ALTER TABLE ONLY authoring.space_page_placements
    ADD CONSTRAINT space_page_placements_page_id_key UNIQUE (page_id);


--
-- Name: space_page_placements space_page_placements_pkey; Type: CONSTRAINT; Schema: authoring; Owner: -
--

ALTER TABLE ONLY authoring.space_page_placements
    ADD CONSTRAINT space_page_placements_pkey PRIMARY KEY (space_id, slug);


--
-- Name: space_page_placements space_page_placements_space_id_page_id_key; Type: CONSTRAINT; Schema: authoring; Owner: -
--

ALTER TABLE ONLY authoring.space_page_placements
    ADD CONSTRAINT space_page_placements_space_id_page_id_key UNIQUE (space_id, page_id);


--
-- Name: spaces spaces_pkey; Type: CONSTRAINT; Schema: authoring; Owner: -
--

ALTER TABLE ONLY authoring.spaces
    ADD CONSTRAINT spaces_pkey PRIMARY KEY (id);


--
-- Name: spaces spaces_tenant_id_id_key; Type: CONSTRAINT; Schema: authoring; Owner: -
--

ALTER TABLE ONLY authoring.spaces
    ADD CONSTRAINT spaces_tenant_id_id_key UNIQUE (tenant_id, id);


--
-- Name: toc_entries toc_entries_pkey; Type: CONSTRAINT; Schema: authoring; Owner: -
--

ALTER TABLE ONLY authoring.toc_entries
    ADD CONSTRAINT toc_entries_pkey PRIMARY KEY (id);


--
-- Name: toc_entries toc_entries_space_id_id_key; Type: CONSTRAINT; Schema: authoring; Owner: -
--

ALTER TABLE ONLY authoring.toc_entries
    ADD CONSTRAINT toc_entries_space_id_id_key UNIQUE (space_id, id);


--
-- Name: attachments_page_id_idx; Type: INDEX; Schema: authoring; Owner: -
--

CREATE INDEX attachments_page_id_idx ON authoring.attachments USING btree (page_id);


--
-- Name: collections_sibling_name_key; Type: INDEX; Schema: authoring; Owner: -
--

CREATE UNIQUE INDEX collections_sibling_name_key ON authoring.collections USING btree (tenant_id, COALESCE(parent_id, '00000000-0000-0000-0000-000000000000'::uuid), name);


--
-- Name: page_tags_label_idx; Type: INDEX; Schema: authoring; Owner: -
--

CREATE INDEX page_tags_label_idx ON authoring.page_tags USING btree (label);


--
-- Name: pages_properties_idx; Type: INDEX; Schema: authoring; Owner: -
--

CREATE INDEX pages_properties_idx ON authoring.pages USING gin (properties);


--
-- Name: pages_tenant_id_trashed_at_idx; Type: INDEX; Schema: authoring; Owner: -
--

CREATE INDEX pages_tenant_id_trashed_at_idx ON authoring.pages USING btree (tenant_id, trashed_at) WHERE (trashed_at IS NOT NULL);


--
-- Name: pages_tenant_status_format; Type: INDEX; Schema: authoring; Owner: -
--

CREATE INDEX pages_tenant_status_format ON authoring.pages USING btree (tenant_id, status, format);


--
-- Name: pages_tenant_updated_page; Type: INDEX; Schema: authoring; Owner: -
--

CREATE INDEX pages_tenant_updated_page ON authoring.pages USING btree (tenant_id, updated_at DESC, id DESC);


--
-- Name: spaces_tenant_id_idx; Type: INDEX; Schema: authoring; Owner: -
--

CREATE INDEX spaces_tenant_id_idx ON authoring.spaces USING btree (tenant_id);


--
-- Name: spaces_tenant_updated_page; Type: INDEX; Schema: authoring; Owner: -
--

CREATE INDEX spaces_tenant_updated_page ON authoring.spaces USING btree (tenant_id, updated_at DESC, id DESC);


--
-- Name: toc_entries_space_id_parent_id_position_idx; Type: INDEX; Schema: authoring; Owner: -
--

CREATE INDEX toc_entries_space_id_parent_id_position_idx ON authoring.toc_entries USING btree (space_id, parent_id, "position");


--
-- Name: pages touch_updated; Type: TRIGGER; Schema: authoring; Owner: -
--

CREATE TRIGGER touch_updated BEFORE UPDATE ON authoring.pages FOR EACH ROW EXECUTE FUNCTION shared.touch_updated_at();


--
-- Name: spaces touch_updated; Type: TRIGGER; Schema: authoring; Owner: -
--

CREATE TRIGGER touch_updated BEFORE UPDATE ON authoring.spaces FOR EACH ROW EXECUTE FUNCTION shared.touch_updated_at();


--
-- Name: attachments attachments_page_id_fkey; Type: FK CONSTRAINT; Schema: authoring; Owner: -
--

ALTER TABLE ONLY authoring.attachments
    ADD CONSTRAINT attachments_page_id_fkey FOREIGN KEY (page_id) REFERENCES authoring.pages(id);


--
-- Name: collection_spaces collection_spaces_collection_id_fkey; Type: FK CONSTRAINT; Schema: authoring; Owner: -
--

ALTER TABLE ONLY authoring.collection_spaces
    ADD CONSTRAINT collection_spaces_collection_id_fkey FOREIGN KEY (collection_id) REFERENCES authoring.collections(id);


--
-- Name: collection_spaces collection_spaces_space_id_fkey; Type: FK CONSTRAINT; Schema: authoring; Owner: -
--

ALTER TABLE ONLY authoring.collection_spaces
    ADD CONSTRAINT collection_spaces_space_id_fkey FOREIGN KEY (space_id) REFERENCES authoring.spaces(id);


--
-- Name: collections collections_parent_same_tenant_fk; Type: FK CONSTRAINT; Schema: authoring; Owner: -
--

ALTER TABLE ONLY authoring.collections
    ADD CONSTRAINT collections_parent_same_tenant_fk FOREIGN KEY (tenant_id, parent_id) REFERENCES authoring.collections(tenant_id, id);


--
-- Name: collections collections_tenant_id_fkey; Type: FK CONSTRAINT; Schema: authoring; Owner: -
--

ALTER TABLE ONLY authoring.collections
    ADD CONSTRAINT collections_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES shared.tenants(id);


--
-- Name: page_tags page_tags_page_id_fkey; Type: FK CONSTRAINT; Schema: authoring; Owner: -
--

ALTER TABLE ONLY authoring.page_tags
    ADD CONSTRAINT page_tags_page_id_fkey FOREIGN KEY (page_id) REFERENCES authoring.pages(id);


--
-- Name: pages pages_tenant_fk; Type: FK CONSTRAINT; Schema: authoring; Owner: -
--

ALTER TABLE ONLY authoring.pages
    ADD CONSTRAINT pages_tenant_fk FOREIGN KEY (tenant_id) REFERENCES shared.tenants(id);


--
-- Name: revisions revisions_page_id_fkey; Type: FK CONSTRAINT; Schema: authoring; Owner: -
--

ALTER TABLE ONLY authoring.revisions
    ADD CONSTRAINT revisions_page_id_fkey FOREIGN KEY (page_id) REFERENCES authoring.pages(id);


--
-- Name: space_page_placements space_page_placements_page_id_fkey; Type: FK CONSTRAINT; Schema: authoring; Owner: -
--

ALTER TABLE ONLY authoring.space_page_placements
    ADD CONSTRAINT space_page_placements_page_id_fkey FOREIGN KEY (page_id) REFERENCES authoring.pages(id);


--
-- Name: space_page_placements space_page_placements_space_id_fkey; Type: FK CONSTRAINT; Schema: authoring; Owner: -
--

ALTER TABLE ONLY authoring.space_page_placements
    ADD CONSTRAINT space_page_placements_space_id_fkey FOREIGN KEY (space_id) REFERENCES authoring.spaces(id);


--
-- Name: spaces spaces_tenant_id_fkey; Type: FK CONSTRAINT; Schema: authoring; Owner: -
--

ALTER TABLE ONLY authoring.spaces
    ADD CONSTRAINT spaces_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES shared.tenants(id);


--
-- Name: toc_entries toc_entries_parent_same_space_fk; Type: FK CONSTRAINT; Schema: authoring; Owner: -
--

ALTER TABLE ONLY authoring.toc_entries
    ADD CONSTRAINT toc_entries_parent_same_space_fk FOREIGN KEY (space_id, parent_id) REFERENCES authoring.toc_entries(space_id, id);


--
-- Name: toc_entries toc_entries_space_id_fkey; Type: FK CONSTRAINT; Schema: authoring; Owner: -
--

ALTER TABLE ONLY authoring.toc_entries
    ADD CONSTRAINT toc_entries_space_id_fkey FOREIGN KEY (space_id) REFERENCES authoring.spaces(id);


--
-- Name: toc_entries toc_entries_target_same_space_fk; Type: FK CONSTRAINT; Schema: authoring; Owner: -
--

ALTER TABLE ONLY authoring.toc_entries
    ADD CONSTRAINT toc_entries_target_same_space_fk FOREIGN KEY (space_id, target_page_id) REFERENCES authoring.space_page_placements(space_id, page_id);


--
-- Name: attachments; Type: ROW SECURITY; Schema: authoring; Owner: -
--

ALTER TABLE authoring.attachments ENABLE ROW LEVEL SECURITY;

--
-- Name: collection_spaces; Type: ROW SECURITY; Schema: authoring; Owner: -
--

ALTER TABLE authoring.collection_spaces ENABLE ROW LEVEL SECURITY;

--
-- Name: collections; Type: ROW SECURITY; Schema: authoring; Owner: -
--

ALTER TABLE authoring.collections ENABLE ROW LEVEL SECURITY;

--
-- Name: page_tags; Type: ROW SECURITY; Schema: authoring; Owner: -
--

ALTER TABLE authoring.page_tags ENABLE ROW LEVEL SECURITY;

--
-- Name: pages; Type: ROW SECURITY; Schema: authoring; Owner: -
--

ALTER TABLE authoring.pages ENABLE ROW LEVEL SECURITY;

--
-- Name: revisions; Type: ROW SECURITY; Schema: authoring; Owner: -
--

ALTER TABLE authoring.revisions ENABLE ROW LEVEL SECURITY;

--
-- Name: space_page_placements; Type: ROW SECURITY; Schema: authoring; Owner: -
--

ALTER TABLE authoring.space_page_placements ENABLE ROW LEVEL SECURITY;

--
-- Name: spaces; Type: ROW SECURITY; Schema: authoring; Owner: -
--

ALTER TABLE authoring.spaces ENABLE ROW LEVEL SECURITY;

--
-- Name: toc_entries; Type: ROW SECURITY; Schema: authoring; Owner: -
--

ALTER TABLE authoring.toc_entries ENABLE ROW LEVEL SECURITY;

--
-- Name: SCHEMA authoring; Type: ACL; Schema: -; Owner: -
--

GRANT USAGE ON SCHEMA authoring TO space_app;


--
-- Name: TABLE attachments; Type: ACL; Schema: authoring; Owner: -
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE authoring.attachments TO space_app;


--
-- Name: TABLE collection_spaces; Type: ACL; Schema: authoring; Owner: -
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE authoring.collection_spaces TO space_app;


--
-- Name: TABLE collections; Type: ACL; Schema: authoring; Owner: -
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE authoring.collections TO space_app;


--
-- Name: TABLE page_tags; Type: ACL; Schema: authoring; Owner: -
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE authoring.page_tags TO space_app;


--
-- Name: TABLE pages; Type: ACL; Schema: authoring; Owner: -
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE authoring.pages TO space_app;


--
-- Name: TABLE revisions; Type: ACL; Schema: authoring; Owner: -
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE authoring.revisions TO space_app;


--
-- Name: SEQUENCE revisions_id_seq; Type: ACL; Schema: authoring; Owner: -
--

GRANT SELECT,USAGE ON SEQUENCE authoring.revisions_id_seq TO space_app;


--
-- Name: TABLE space_page_placements; Type: ACL; Schema: authoring; Owner: -
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE authoring.space_page_placements TO space_app;


--
-- Name: TABLE spaces; Type: ACL; Schema: authoring; Owner: -
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE authoring.spaces TO space_app;


--
-- Name: TABLE toc_entries; Type: ACL; Schema: authoring; Owner: -
--

GRANT SELECT,INSERT,DELETE,UPDATE ON TABLE authoring.toc_entries TO space_app;


--
-- PostgreSQL database dump complete
--

-- 附件浏览：时间与引用身份的稳定有界候选窗口。
CREATE INDEX attachments_created_at_id_idx ON authoring.attachments (created_at DESC, id DESC);
