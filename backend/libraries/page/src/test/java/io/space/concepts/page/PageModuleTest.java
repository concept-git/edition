package io.space.concepts.page;

import static org.assertj.core.api.Assertions.assertThat;

import io.space.concepts.page.api.*;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.modulith.test.ApplicationModuleTest;
import org.springframework.modulith.test.PublishedEvents;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.transaction.annotation.Transactional;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

@ApplicationModuleTest
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_CLASS)
@Testcontainers
@org.springframework.context.annotation.Import({
    PageModuleTest.PreciseClock.class,
    io.space.concepts.page.adapters.PageConfiguration.class
})
class PageModuleTest {
    @org.springframework.boot.test.context.TestConfiguration(proxyBeanMethods = false)
    static class PreciseClock {
        @org.springframework.context.annotation.Bean
        @org.springframework.context.annotation.Primary
        java.time.Clock preciseClock() {
            // Mac 时钟通常只有微秒；固定纳秒输入，让数据库往返精度在各平台都受检。
            return java.time.Clock.fixed(
                    java.time.Instant.parse("2026-10-12T00:00:00.123456789Z"), java.time.ZoneOffset.UTC);
        }
    }

    @Container
    @ServiceConnection
    static final PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:18.6");

    @Autowired
    PageApi pages;

    @Autowired
    JdbcTemplate jdbc;

    @Autowired
    @org.springframework.beans.factory.annotation.Qualifier("fixtureJdbcTemplate")
    JdbcTemplate fixtures;

    @Test
    void businessConnectionsUseTheRestrictedRlsRole() {
        assertThat(jdbc.queryForObject("select current_user", String.class)).isEqualTo("space_app");
        assertThat(fixtures.queryForObject("select current_user", String.class)).isNotEqualTo("space_app");
        assertThat(jdbc.queryForObject("select rolbypassrls from pg_roles where rolname=current_user", Boolean.class))
                .isFalse();
    }

    @Test
    @Transactional
    void attachmentScanIsBoundedBeforeFilteringAndKeepsItsContinuation() {
        inTenant();
        var author = PageApi.Actor.system();
        var created = (PageApi.CreateResult.Created) pages.create(author, PageApi.Format.MARKDOWN, "Attachment scan");
        var id = new PageApi.PageId(created.page().id());
        byte[] pdf = "%PDF-1.7".getBytes(java.nio.charset.StandardCharsets.US_ASCII);
        for (int i = 0; i < 5; i++) pages.attach(id, new PageApi.FileUpload("file_100%.pdf", pdf), author);
        var empty = pages.scanAttachments(null, 2, "not-found", "all");
        assertThat(empty.items()).isEmpty();
        assertThat(empty.scanned()).isEqualTo(2);
        assertThat(empty.nextCursor()).isNotNull();
        var next = pages.scanAttachments(empty.nextCursor(), 2, "FILE_100%", "pdf");
        assertThat(next.items()).hasSize(2);
        assertThat(next.scanned()).isEqualTo(2);
        var last = pages.scanAttachments(next.nextCursor(), 2, "", "all");
        assertThat(last.items()).hasSize(1);
        assertThat(last.nextCursor()).isNull();
        pages.trash(id, author);
        assertThat(pages.scanAttachments(null, 100, "", "all").items()).isEmpty();
    }

    @Test
    @Transactional
    void createEditAndPublishWalkTheAuthoringLifecycle(PublishedEvents events) {
        inTenant();
        PageApi.Actor author = PageApi.Actor.user(UUID.randomUUID());
        var created = (PageApi.CreateResult.Created) pages.create(author, PageApi.Format.MARKDOWN, " Guide ");

        assertThat(created.page().revision()).isZero();
        assertThat(created.page().content()).isEmpty();
        var edited = (PageApi.EditResult.Edited)
                pages.edit(new PageApi.PageId(created.page().id()), "# Guide", 0, author);
        assertThat(edited.page().revision()).isEqualTo(1);
        assertThat(pages.rename(new PageApi.PageId(created.page().id()), "Reference", author))
                .isInstanceOf(PageApi.MutationResult.Changed.class);
        PageApi.PageId id = new PageApi.PageId(created.page().id());
        assertThat(pages.publish(id, author).orElseThrow().status()).isEqualTo(PageApi.Status.PUBLISHED);
        assertThat(pages.view(id).orElseThrow().title()).isEqualTo("Reference");
        assertThat(pages.views(java.util.Set.of(id)))
                .singleElement()
                .extracting(PageApi.View::id)
                .isEqualTo(created.page().id());
        assertThat(events.ofType(PageEvents.Created.class)).hasSize(1);
        assertThat(events.ofType(PageEvents.Edited.class)).hasSize(1);
        assertThat(events.ofType(PageEvents.Published.class)).hasSize(1);
    }

    @Test
    @Transactional
    void staleEditAndInvalidInputsAreFiniteOutputs() {
        inTenant();
        PageApi.Actor author = PageApi.Actor.user(UUID.randomUUID());
        var invalidTitle = pages.create(author, PageApi.Format.MARKDOWN, " ");
        var created = (PageApi.CreateResult.Created) pages.create(author, PageApi.Format.HTML, "Guide");
        PageApi.PageId id = new PageApi.PageId(created.page().id());
        pages.edit(id, "theirs", 0, author);

        assertThat(invalidTitle).isInstanceOf(PageApi.CreateResult.InvalidTitle.class);
        assertThat(pages.edit(id, "mine", 0, author)).isInstanceOf(PageApi.EditResult.Conflict.class);
        assertThat(pages.edit(new PageApi.PageId(UUID.randomUUID()), "missing", 0, author))
                .isInstanceOf(PageApi.EditResult.NotFound.class);
    }

    @Test
    @Transactional
    void createWithCallerSuppliedIdRoundTripsAndRejectsDuplicates(PublishedEvents events) {
        inTenant();
        PageApi.Actor author = PageApi.Actor.user(UUID.randomUUID());
        PageApi.PageId id = new PageApi.PageId(UUID.randomUUID());

        var created = (PageApi.CreateResult.Created) pages.create(author, PageApi.Format.MARKDOWN, " Imported ", id);
        assertThat(created.page().id()).isEqualTo(id.value());
        assertThat(created.page().title()).isEqualTo("Imported");
        assertThat(created.page().revision()).isZero();
        assertThat(pages.view(id).orElseThrow().id()).isEqualTo(id.value());
        assertThat(pages.create(author, PageApi.Format.HTML, "Other", id))
                .isInstanceOf(PageApi.CreateResult.IdTaken.class);
        assertThat(pages.view(id).orElseThrow().title()).isEqualTo("Imported");
        PageApi.PageId unused = new PageApi.PageId(UUID.randomUUID());
        assertThat(pages.create(author, PageApi.Format.MARKDOWN, " ", unused))
                .isInstanceOf(PageApi.CreateResult.InvalidTitle.class);
        assertThat(pages.view(unused)).isEmpty();
        assertThat(events.ofType(PageEvents.Created.class)).hasSize(1);
    }

    @Test
    @Transactional
    void pagesThroughTenantScopedStateWithoutLoadingTheWholeConcept() {
        inTenant();
        PageApi.Actor author = PageApi.Actor.user(UUID.randomUUID());
        for (int index = 1; index <= 3; index++) {
            pages.create(author, PageApi.Format.MARKDOWN, "Page " + index);
        }

        var first = pages.page(null, 2, java.util.Optional.empty(), java.util.Optional.of(PageApi.Format.MARKDOWN));
        var second = pages.page(
                first.nextCursor(), 2, java.util.Optional.empty(), java.util.Optional.of(PageApi.Format.MARKDOWN));

        assertThat(first.items()).hasSize(2);
        assertThat(first.nextCursor()).isNotBlank();
        assertThat(second.items()).hasSize(1);
        assertThat(second.nextCursor()).isNull();
        assertThat(java.util.stream.Stream.concat(first.items().stream(), second.items().stream())
                        .map(PageApi.View::id))
                .doesNotHaveDuplicates();
    }

    @Test
    @Transactional
    void seoIconAndPropertiesRoundTripWithoutMovingTheBaseline(PublishedEvents events) {
        inTenant();
        PageApi.Actor author = PageApi.Actor.user(UUID.randomUUID());
        var created = (PageApi.CreateResult.Created) pages.create(author, PageApi.Format.MARKDOWN, "Quick start");
        PageApi.PageId id = new PageApi.PageId(created.page().id());
        pages.edit(id, "# body", 0, author);

        var seo = (PageApi.MetadataResult.Changed) pages.setSeo(
                id,
                new PageApi.SeoPatch(
                        PageApi.Patch.unchanged(),
                        PageApi.Patch.set("分页查询"),
                        PageApi.Patch.unchanged(),
                        PageApi.Patch.set("https://cdn.example.com/og.png"),
                        java.util.Optional.of(true)),
                author);
        assertThat(seo.page().seo().description()).isEqualTo("分页查询");
        assertThat(seo.page().seo().noIndex()).isTrue();
        assertThat(pages.setIcon(id, "https://cdn.example.com/icon.png", author))
                .isInstanceOf(PageApi.MetadataResult.Changed.class);
        assertThat(pages.setProperty(id, "doc_type", "api", author)).isInstanceOf(PageApi.MetadataResult.Changed.class);
        assertThat(pages.setProperty(id, "product", "ecs", author)).isInstanceOf(PageApi.MetadataResult.Changed.class);
        assertThat(pages.removeProperty(id, "product", author)).isInstanceOf(PageApi.MetadataResult.Changed.class);

        PageApi.View reread = pages.view(id).orElseThrow();
        assertThat(reread.seo()).isEqualTo(new PageApi.Seo(null, "分页查询", null, "https://cdn.example.com/og.png", true));
        assertThat(reread.icon()).isEqualTo("https://cdn.example.com/icon.png");
        assertThat(reread.properties()).containsExactly(java.util.Map.entry("doc_type", "api"));
        assertThat(reread.revision()).isEqualTo(1);
        assertThat(pages.setProperty(id, "9bad", "x", author))
                .isInstanceOfSatisfying(
                        PageApi.MetadataResult.Invalid.class,
                        invalid -> assertThat(invalid.field()).isEqualTo("field"));
        assertThat(events.ofType(PageEvents.MetadataChanged.class)).hasSize(5);
    }

    @Test
    @Transactional
    void attachFollowsThePageThroughTrashAndDetachOnlyDropsTheReference() {
        inTenant();
        PageApi.Actor author = PageApi.Actor.user(UUID.randomUUID());
        var created = (PageApi.CreateResult.Created) pages.create(author, PageApi.Format.MARKDOWN, "Files");
        PageApi.PageId id = new PageApi.PageId(created.page().id());
        byte[] png = {(byte) 0x89, 'P', 'N', 'G', 0x0D, 0x0A, 0x1A, 0x0A, 1, 2, 3};

        var attached = (PageApi.AttachResult.Attached) pages.attach(id, new PageApi.FileUpload("a.png", png), author);
        assertThat(attached.attachment().mime()).isEqualTo("image/png");
        assertThat(attached.attachment().storageKey()).hasSize(64);
        assertThat(pages.attachment(id, attached.attachment().ref())).contains(attached.attachment());
        assertThat(pages.view(id).orElseThrow().attachments()).hasSize(1);
        assertThat(pages.views(java.util.Set.of(id)))
                .singleElement()
                .extracting(view -> view.attachments().size())
                .isEqualTo(1);

        pages.trash(id, author);
        assertThat(pages.attachment(id, attached.attachment().ref())).contains(attached.attachment());
        pages.restore(id, author);

        assertThat(pages.attach(id, new PageApi.FileUpload("t.txt", "plain".getBytes()), author))
                .isInstanceOf(PageApi.AttachResult.FileTypeUnsupported.class);
        assertThat(pages.attach(
                        id,
                        new PageApi.FileUpload("big.png", new byte[(int) PageApi.MAX_ATTACHMENT_BYTES + 1]),
                        author))
                .isInstanceOf(PageApi.AttachResult.FileTooLarge.class);

        assertThat(pages.detach(id, attached.attachment().ref(), author))
                .isInstanceOf(PageApi.MetadataResult.Changed.class);
        assertThat(pages.detach(id, attached.attachment().ref(), author))
                .isInstanceOf(PageApi.MetadataResult.Changed.class);
        assertThat(pages.attachment(id, attached.attachment().ref())).isEmpty();
        assertThat(jdbc.queryForObject(
                        "select count(*) from authoring.attachments where page_id = ?", Long.class, id.value()))
                .isZero();
    }

    @Test
    @Transactional
    void trashPersistsUntilRestoreAndLeavesTheWorkingSet(PublishedEvents events) {
        inTenant();
        PageApi.Actor author = PageApi.Actor.user(UUID.randomUUID());
        var created = (PageApi.CreateResult.Created) pages.create(author, PageApi.Format.MARKDOWN, "Guide");
        PageApi.PageId id = new PageApi.PageId(created.page().id());
        pages.edit(id, "# body", 0, author);

        var firstTrash = pages.trash(id, author).orElseThrow();
        assertThat(firstTrash.changed()).isTrue();
        PageApi.View trashed = firstTrash.page();
        assertThat(trashed.trashedAt()).isNotNull();
        assertThat(trashed.revision()).isEqualTo(1);
        assertThat(pages.page(null, 20, java.util.Optional.empty(), java.util.Optional.empty())
                        .items())
                .extracting(PageApi.View::id)
                .doesNotContain(id.value());
        assertThat(pages.trashed(null, 20).items()).extracting(PageApi.View::id).containsExactly(id.value());
        var repeatedTrash = pages.trash(id, author).orElseThrow();
        assertThat(repeatedTrash.changed()).isFalse();
        assertThat(repeatedTrash.page().trashedAt()).isEqualTo(trashed.trashedAt());
        assertThat(events.ofType(PageEvents.Trashed.class)).hasSize(1);

        var firstRestore = pages.restore(id, author).orElseThrow();
        assertThat(firstRestore.changed()).isTrue();
        PageApi.View restored = firstRestore.page();
        assertThat(restored.trashedAt()).isNull();
        assertThat(restored.revision()).isEqualTo(1);
        assertThat(pages.page(null, 20, java.util.Optional.empty(), java.util.Optional.empty())
                        .items())
                .extracting(PageApi.View::id)
                .contains(id.value());
        assertThat(pages.trashed(null, 20).items()).isEmpty();
        var repeatedRestore = pages.restore(id, author).orElseThrow();
        assertThat(repeatedRestore.changed()).isFalse();
        assertThat(repeatedRestore.page().trashedAt()).isNull();
        assertThat(events.ofType(PageEvents.Restored.class)).hasSize(1);
    }

    @Test
    @Transactional
    void publishPersistsUntilUnpublishWithoutMovingTheBaseline(PublishedEvents events) {
        inTenant();
        PageApi.Actor author = PageApi.Actor.user(UUID.randomUUID());
        var created = (PageApi.CreateResult.Created) pages.create(author, PageApi.Format.MARKDOWN, "Guide");
        PageApi.PageId id = new PageApi.PageId(created.page().id());
        pages.edit(id, "# body", 0, author);

        PageApi.View published = pages.publish(id, author).orElseThrow();
        assertThat(published.status()).isEqualTo(PageApi.Status.PUBLISHED);
        assertThat(published.revision()).isEqualTo(1);
        assertThat(pages.publish(id, author).orElseThrow().status()).isEqualTo(PageApi.Status.PUBLISHED);
        assertThat(events.ofType(PageEvents.Published.class)).hasSize(1);

        PageApi.View draft = pages.unpublish(id, author).orElseThrow();
        assertThat(draft.status()).isEqualTo(PageApi.Status.DRAFT);
        assertThat(draft.revision()).isEqualTo(1);
        assertThat(pages.unpublish(id, author).orElseThrow().status()).isEqualTo(PageApi.Status.DRAFT);
        assertThat(events.ofType(PageEvents.Unpublished.class)).hasSize(1);
        assertThat(pages.publish(new PageApi.PageId(UUID.randomUUID()), author)).isEmpty();
    }

    @Test
    @Transactional
    void replacingPropertiesIsAtomicAndDoesNotMoveTheContentBaseline() {
        inTenant();
        var actor = PageApi.Actor.system();
        var created = (PageApi.CreateResult.Created) pages.create(actor, PageApi.Format.MARKDOWN, "Imported");
        var id = new PageApi.PageId(created.page().id());
        pages.edit(id, "body", 0, actor);
        pages.setProperty(id, "old", "retained on rejection", actor);
        var invalid = new java.util.LinkedHashMap<String, String>();
        invalid.put("valid", "new");
        invalid.put("9bad", "invalid");
        assertThat(pages.replaceProperties(id, invalid, actor)).isInstanceOf(PageApi.MetadataResult.Invalid.class);
        assertThat(pages.view(id).orElseThrow().properties())
                .containsExactly(java.util.Map.entry("old", "retained on rejection"));
        var wanted = new java.util.LinkedHashMap<String, String>();
        for (int i = 0; i < PageApi.MAX_PROPERTIES; i++) wanted.put("key" + i, "value" + i);
        assertThat(pages.replaceProperties(id, wanted, actor)).isInstanceOf(PageApi.MetadataResult.Changed.class);
        var replaced = pages.view(id).orElseThrow();
        assertThat(replaced.properties()).isEqualTo(wanted);
        assertThat(replaced.revision()).isEqualTo(1);
        assertThat(replaced.content()).isEqualTo("body");
        wanted.put("overflow", "rejected");
        assertThat(pages.replaceProperties(id, wanted, actor)).isInstanceOf(PageApi.MetadataResult.Invalid.class);
        assertThat(pages.view(id).orElseThrow().properties()).hasSize(50).doesNotContainKey("overflow");
        assertThat(pages.replaceProperties(id, java.util.Map.of(), actor))
                .isInstanceOf(PageApi.MetadataResult.Changed.class);
        assertThat(pages.view(id).orElseThrow().properties()).isEmpty();
    }

    @Test
    @Transactional
    void createWithInitialContentPersistsOneBaselineAndRejectsInvalidMetadataWithoutAnEmptyPage() {
        inTenant();
        var actor = PageApi.Actor.system();
        var id = new PageApi.PageId(UUID.randomUUID());
        var initial = new PageApi.InitialContent(
                "<p>body</p>",
                new PageApi.Seo(null, "description", null, null, false),
                java.util.Map.of("product", "ecs"));
        var created =
                (PageApi.CreateContentResult.Created) pages.create(actor, PageApi.Format.HTML, "Imported", id, initial);
        assertThat(pages.view(id)).contains(created.page());
        assertThat(created.page().content()).isEqualTo("<p>body</p>");
        assertThat(created.page().revision()).isEqualTo(1);
        assertThat(created.page().status()).isEqualTo(PageApi.Status.DRAFT);
        assertThat(created.page().seo().description()).isEqualTo("description");
        assertThat(created.page().properties()).containsEntry("product", "ecs");
        assertThat(pages.create(actor, PageApi.Format.HTML, "Duplicate", id, initial))
                .isInstanceOf(PageApi.CreateContentResult.IdTaken.class);
        var rejected = new PageApi.PageId(UUID.randomUUID());
        assertThat(pages.create(
                        actor,
                        PageApi.Format.HTML,
                        "Invalid",
                        rejected,
                        new PageApi.InitialContent("body", PageApi.Seo.empty(), java.util.Map.of("9bad", "value"))))
                .isInstanceOf(PageApi.CreateContentResult.Invalid.class);
        assertThat(pages.view(rejected)).isEmpty();
        assertThat(pages.create(
                        actor,
                        PageApi.Format.HTML,
                        "Too large",
                        rejected,
                        new PageApi.InitialContent(
                                "x".repeat(PageApi.MAX_CONTENT_BYTES + 1), PageApi.Seo.empty(), java.util.Map.of())))
                .isInstanceOf(PageApi.CreateContentResult.ContentTooLarge.class);
        assertThat(pages.view(rejected)).isEmpty();
    }

    private void inTenant() {
        UUID tenant = UUID.randomUUID();
        fixtures.update("insert into shared.tenants (id, name) values (?, ?)", tenant, "Tenant " + tenant);
        jdbc.queryForObject("select set_config('app.tenant_id', ?, true)", String.class, tenant.toString());
    }
}
