package io.space.concepts.release.domain;

import static org.assertj.core.api.Assertions.assertThat;

import io.space.concepts.release.api.*;
import io.space.concepts.release.api.ContentHash;
import io.space.concepts.release.api.ReleaseApi;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.junit.jupiter.api.Test;

class BundleRulesTest {
    @Test
    void relativeAttachmentHrefFromContentDirIsNotABrokenLink() {
        var attachment = new ReleaseApi.AttachmentRef("attachments/pixel.png", "store/pixel", ContentHash.hex("pixel"));
        var page = new ReleaseApi.PageSnapshot(
                UUID.randomUUID(),
                "welcome",
                "Welcome",
                ReleaseApi.Format.MARKDOWN,
                "![pixel](../attachments/pixel.png)\n",
                "content/welcome.md",
                new ReleaseApi.Seo(null, "Hello", null, null, false),
                null,
                Map.of(),
                "welcome",
                List.of(attachment),
                0);
        var report = BundleRules.validateIssues(bundle(
                page,
                Map.of(
                        "content/welcome.md",
                        ContentHash.checksum(page.content()),
                        "attachments/pixel.png",
                        "sha256:" + attachment.sha256())));
        assertThat(report.errors()).isEmpty();
        assertThat(report.info()).extracting(ReleaseApi.Issue::code).doesNotContain("unused_attachment");
    }

    @Test
    void unknownSlugStaysBroken() {
        var page = new ReleaseApi.PageSnapshot(
                UUID.randomUUID(),
                "welcome",
                "Welcome",
                ReleaseApi.Format.MARKDOWN,
                "[gone](no-such-page)\n",
                "content/welcome.md",
                new ReleaseApi.Seo(null, "Hello", null, null, false),
                null,
                Map.of(),
                "welcome",
                List.of(),
                0);
        var report = BundleRules.validateIssues(
                bundle(page, Map.of("content/welcome.md", ContentHash.checksum(page.content()))));
        assertThat(report.errors()).extracting(ReleaseApi.Issue::code).contains("broken_link");
    }

    @Test
    void originalHtmlNonDocumentReferencesAreNotMistakenForMissingPages() {
        String original = "<!doctype html><link href='style.css'><a href='javascript:void(0)'>open</a>"
                + "<a href='tel:123'>call</a><script>var t=\"<a href='missing.html'>\";</script>";
        var page = new ReleaseApi.PageSnapshot(
                UUID.randomUUID(),
                "welcome",
                "Welcome",
                ReleaseApi.Format.HTML,
                original,
                "content/welcome.html",
                new ReleaseApi.Seo(null, "Hello", null, null, false),
                null,
                Map.of(),
                "welcome.html",
                List.of(),
                0);
        var report = BundleRules.validateIssues(bundle(page, Map.of()));
        assertThat(report.errors()).isEmpty();
        assertThat(page.content()).isEqualTo(original);
    }

    @Test
    void originalHtmlResolvesRelativeLinksFromSourcePath() {
        var source =
                htmlPage("public/start.html", "source/chapter/start", "<a href='../reference/detail.html'>next</a>");
        var target = htmlPage("public/detail.html", "source/reference/detail", "<p>Detail</p>");
        var report = BundleRules.validateIssues(new ReleaseApi.Bundle(
                "1.0",
                "bundle-v1",
                Instant.parse("2026-09-06T00:00:00Z"),
                List.of(source, target),
                List.of(),
                Map.of()));
        assertThat(report.errors()).isEmpty();
        assertThat(source.content()).contains("../reference/detail.html");
    }

    private static ReleaseApi.PageSnapshot htmlPage(String slug, String externalId, String content) {
        return new ReleaseApi.PageSnapshot(
                UUID.randomUUID(),
                slug,
                "HTML",
                ReleaseApi.Format.HTML,
                content,
                "content/" + slug,
                new ReleaseApi.Seo(null, "HTML", null, null, false),
                null,
                Map.of(),
                externalId,
                List.of(),
                0);
    }

    private static ReleaseApi.Bundle bundle(ReleaseApi.PageSnapshot page, Map<String, String> checksums) {
        return new ReleaseApi.Bundle(
                "1.0", "bundle-v1", Instant.parse("2026-09-06T00:00:00Z"), List.of(page), List.of(), checksums);
    }
}
