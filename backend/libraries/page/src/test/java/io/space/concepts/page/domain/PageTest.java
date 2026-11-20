package io.space.concepts.page.domain;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatExceptionOfType;

import io.space.concepts.page.api.*;
import io.space.concepts.page.api.PageApi;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import org.junit.jupiter.api.Test;

class PageTest {
    private static final byte[] PNG = {(byte) 0x89, 'P', 'N', 'G', 0x0D, 0x0A, 0x1A, 0x0A, 0, 0, 0, 0};
    private final PageApi.Actor actor = PageApi.Actor.user(UUID.randomUUID());
    private final Instant now = Instant.parse("2026-09-03T00:00:00Z");

    @Test
    void startsAtRevisionZeroAndEverySuccessfulSaveAdvancesTheBaseline() {
        Page page = page();

        assertThat(page.view().revision()).isZero();
        assertThat(page.edit("first", 0, actor)).isEqualTo(1);
        assertThat(page.edit("first", 1, actor)).isEqualTo(2);

        assertThat(page.view().content()).isEqualTo("first");
        assertThat(page.view().revision()).isEqualTo(2);
    }

    @Test
    void staleBaselineReturnsTheCurrentContentWithoutChangingThePage() {
        Page page = page();
        page.edit("theirs", 0, actor);

        assertThatExceptionOfType(Page.EditConflict.class)
                .isThrownBy(() -> page.edit("mine", 0, PageApi.Actor.user(UUID.randomUUID())))
                .satisfies(conflict -> {
                    assertThat(conflict.theirs()).isEqualTo("theirs");
                    assertThat(conflict.currentRevision()).isEqualTo(1);
                });
        assertThat(page.view().content()).isEqualTo("theirs");
        assertThat(page.view().revision()).isEqualTo(1);
    }

    @Test
    void titleAndContentLimitsAreOwnedByTheAggregate() {
        assertThatExceptionOfType(PageTitle.Invalid.class).isThrownBy(() -> new PageTitle(" "));
        assertThatExceptionOfType(PageTitle.Invalid.class).isThrownBy(() -> new PageTitle("x".repeat(201)));
        assertThatExceptionOfType(Page.ContentTooLarge.class)
                .isThrownBy(() -> page().edit("界".repeat(699_051), 0, actor));
    }

    @Test
    void seoPatchKeepsOmittedFieldsClearsBlankAndNeverTouchesTheBaseline() {
        Page page = page();
        page.edit("body", 0, actor);

        page.setSeo(
                new PageApi.SeoPatch(
                        PageApi.Patch.set("  Quick start  "),
                        PageApi.Patch.set("分页查询"),
                        PageApi.Patch.unchanged(),
                        PageApi.Patch.set("https://cdn.example.com/og.png"),
                        Optional.of(true)),
                actor);
        page.setSeo(
                new PageApi.SeoPatch(
                        PageApi.Patch.unchanged(),
                        PageApi.Patch.set("   "),
                        PageApi.Patch.unchanged(),
                        PageApi.Patch.clear(),
                        Optional.empty()),
                actor);

        PageApi.Seo seo = page.view().seo();
        assertThat(seo.title()).isEqualTo("Quick start");
        assertThat(seo.description()).isNull();
        assertThat(seo.keywords()).isNull();
        assertThat(seo.ogImage()).isNull();
        assertThat(seo.noIndex()).isTrue();
        assertThat(page.view().revision()).isEqualTo(1);
    }

    @Test
    void seoAndIconRejectEmptyPatchOverlongTextAndNonHttpUrls() {
        Page page = page();
        var empty = new PageApi.SeoPatch(
                PageApi.Patch.unchanged(),
                PageApi.Patch.unchanged(),
                PageApi.Patch.unchanged(),
                PageApi.Patch.unchanged(),
                Optional.empty());
        assertThatExceptionOfType(Page.InvalidField.class)
                .isThrownBy(() -> page.setSeo(empty, actor))
                .satisfies(invalid -> assertThat(invalid.code()).isEqualTo("empty_patch"));
        assertThatExceptionOfType(Page.InvalidField.class)
                .isThrownBy(() -> page.setSeo(seoTitle("x".repeat(201)), actor))
                .satisfies(invalid -> {
                    assertThat(invalid.field()).isEqualTo("title");
                    assertThat(invalid.code()).isEqualTo("too_long");
                });
        assertThatExceptionOfType(Page.InvalidField.class)
                .isThrownBy(() -> page.setIcon("javascript:alert(1)", actor))
                .satisfies(invalid -> assertThat(invalid.code()).isEqualTo("invalid_url"));
        assertThatExceptionOfType(Page.InvalidField.class).isThrownBy(() -> page.setIcon("/relative/icon.png", actor));
        page.setIcon("https://cdn.example.com/icon.png", actor);
        page.setIcon(null, actor);
        assertThat(page.view().icon()).isNull();
    }

    @Test
    void propertiesAreAStringMapWithKeyValueAndCountLimits() {
        Page page = page();
        page.setProperty(" doc_type ", "api", actor);
        page.setProperty("doc_type", "guide", actor);
        assertThat(page.view().properties()).containsExactly(Map.entry("doc_type", "guide"));

        assertThatExceptionOfType(Page.InvalidField.class).isThrownBy(() -> page.setProperty("1abc", "x", actor));
        assertThatExceptionOfType(Page.InvalidField.class).isThrownBy(() -> page.setProperty("a b", "x", actor));
        assertThatExceptionOfType(Page.InvalidField.class)
                .isThrownBy(() -> page.setProperty("k".repeat(65), "x", actor));
        assertThatExceptionOfType(Page.InvalidField.class)
                .isThrownBy(() -> page.setProperty("big", "界".repeat(1366), actor))
                .satisfies(invalid -> assertThat(invalid.field()).isEqualTo("value"));
        for (int index = 1; index < PageApi.MAX_PROPERTIES; index++) page.setProperty("k" + index, "v", actor);
        assertThatExceptionOfType(Page.InvalidField.class)
                .isThrownBy(() -> page.setProperty("overflow", "v", actor))
                .satisfies(invalid -> assertThat(invalid.code()).isEqualTo("too_many"));
        page.setProperty("k1", "updated", actor);

        assertThat(page.removeProperty("doc_type", actor)).isTrue();
        assertThat(page.removeProperty("doc_type", actor)).isFalse();
    }

    @Test
    void attachmentsAreSniffedContentAddressedAndDetachIsIdempotent() {
        Page page = page();
        PageApi.Attachment attached = page.attach(new PageApi.FileUpload("diagram.png", PNG), actor, now);

        assertThat(attached.mime()).isEqualTo("image/png");
        assertThat(attached.sizeBytes()).isEqualTo(PNG.length);
        assertThat(attached.storageKey()).isEqualTo(AttachmentFile.sha256(PNG)).hasSize(64);
        assertThat(page.attachment(attached.ref())).contains(attached);
        assertThat(page.view().revision()).isZero();

        assertThat(page.detach(attached.ref(), actor)).contains(attached);
        assertThat(page.detach(attached.ref(), actor)).isEmpty();
        assertThat(page.view().attachments()).isEmpty();
    }

    @Test
    void publishAndUnpublishToggleStatusWithoutMovingTheBaseline() {
        Page page = page();
        page.edit("body", 0, actor);

        assertThat(page.publish(actor)).isTrue();
        assertThat(page.view().status()).isEqualTo(PageApi.Status.PUBLISHED);
        assertThat(page.view().revision()).isEqualTo(1);
        assertThat(page.publish(actor)).isFalse();
        assertThat(page.view().status()).isEqualTo(PageApi.Status.PUBLISHED);

        assertThat(page.unpublish(actor)).isTrue();
        assertThat(page.view().status()).isEqualTo(PageApi.Status.DRAFT);
        assertThat(page.view().revision()).isEqualTo(1);
        assertThat(page.unpublish(actor)).isFalse();
        assertThat(page.view().status()).isEqualTo(PageApi.Status.DRAFT);
    }

    @Test
    void trashIsIdempotentWithoutResettingTheClockOrMovingTheBaseline() {
        Page page = page();
        page.edit("body", 0, actor);
        Instant first = Instant.parse("2026-09-05T00:00:00Z");
        Instant later = Instant.parse("2026-09-05T01:00:00Z");

        assertThat(page.trash(first, actor)).isTrue();
        assertThat(page.view().trashedAt()).isEqualTo(first);
        assertThat(page.view().revision()).isEqualTo(1);
        assertThat(page.trash(later, actor)).isFalse();
        assertThat(page.view().trashedAt()).isEqualTo(first);
        assertThat(page.restore(actor)).isTrue();
        assertThat(page.view().trashedAt()).isNull();
        assertThat(page.view().revision()).isEqualTo(1);
        assertThat(page.restore(actor)).isFalse();
        assertThat(page.view().trashedAt()).isNull();
    }

    @Test
    void attachRejectsDeclaredTypesOversizeBadNamesAndTheFiftyFirstFile() {
        Page page = page();
        byte[] text = "hello".getBytes(StandardCharsets.UTF_8);
        assertThatExceptionOfType(AttachmentFile.FileTypeUnsupported.class)
                .isThrownBy(() -> page.attach(new PageApi.FileUpload("fake.png", text), actor, now));
        assertThatExceptionOfType(AttachmentFile.FileTypeUnsupported.class)
                .isThrownBy(() -> page.attach(
                        new PageApi.FileUpload("x.svg", "<svg/>".getBytes(StandardCharsets.UTF_8)), actor, now));
        assertThatExceptionOfType(AttachmentFile.FileTooLarge.class)
                .isThrownBy(() -> page.attach(
                        new PageApi.FileUpload("big.png", new byte[(int) PageApi.MAX_ATTACHMENT_BYTES + 1]),
                        actor,
                        now));
        assertThatExceptionOfType(AttachmentFile.FilenameInvalid.class)
                .isThrownBy(() -> page.attach(new PageApi.FileUpload("../etc/passwd", PNG), actor, now));
        assertThatExceptionOfType(AttachmentFile.FilenameInvalid.class)
                .isThrownBy(() -> page.attach(new PageApi.FileUpload("  ", PNG), actor, now));

        for (int index = 0; index < PageApi.MAX_ATTACHMENTS; index++) {
            page.attach(new PageApi.FileUpload("same-name.png", PNG), actor, now);
        }
        assertThatExceptionOfType(Page.TooManyAttachments.class)
                .isThrownBy(() -> page.attach(new PageApi.FileUpload("one-more.png", PNG), actor, now));
    }

    private static PageApi.SeoPatch seoTitle(String value) {
        return new PageApi.SeoPatch(
                PageApi.Patch.set(value),
                PageApi.Patch.unchanged(),
                PageApi.Patch.unchanged(),
                PageApi.Patch.unchanged(),
                Optional.empty());
    }

    private Page page() {
        Instant created = Instant.parse("2026-09-02T00:00:00Z");
        return new Page(
                UUID.randomUUID(),
                new PageTitle(" Guide "),
                PageApi.Format.MARKDOWN,
                "",
                0,
                PageApi.Status.DRAFT,
                PageApi.Seo.empty(),
                null,
                Map.of(),
                List.of(),
                null,
                created,
                actor,
                created,
                actor);
    }
}
