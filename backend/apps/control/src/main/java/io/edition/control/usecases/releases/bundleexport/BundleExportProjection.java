package io.edition.control.usecases.releases.bundleexport;

import io.edition.control.modules.bundleexport.api.*;
import io.edition.control.modules.release.api.ReleaseApi;
import java.util.*;
import org.springframework.stereotype.Component;

@Component
final class BundleExportProjection {
    ExportSnapshot snapshot(ReleaseApi.Bundle bundle) {
        return new ExportSnapshot(
                "space",
                java.time.Instant.now(),
                bundle.pages().stream()
                        .map(page -> {
                            var seo = new LinkedHashMap<String, Object>();
                            seo.put("title", page.seo().title());
                            seo.put("description", page.seo().description());
                            seo.put("keywords", page.seo().keywords());
                            seo.put("ogImage", page.seo().ogImage());
                            seo.put("noIndex", page.seo().noIndex());
                            return new ExportSnapshot.Page(
                                    page.pageId(),
                                    page.externalId() == null ? page.pageId().toString() : page.externalId(),
                                    page.slug(),
                                    page.title(),
                                    page.format().name().toLowerCase(Locale.ROOT),
                                    page.content(),
                                    seo,
                                    page.icon(),
                                    page.properties(),
                                    page.attachments().stream()
                                            .map(a ->
                                                    new ExportSnapshot.Attachment(a.path(), a.storageKey(), a.sha256()))
                                            .toList(),
                                    page.contentProfile(),
                                    page.contentTypeDefinition());
                        })
                        .toList(),
                bundle.toc().stream().map(this::node).toList());
    }

    private ExportSnapshot.Node node(ReleaseApi.TocNode node) {
        return new ExportSnapshot.Node(
                node.label(),
                node.kind().name().toLowerCase(Locale.ROOT),
                node.ref(),
                node.url(),
                node.children().stream().map(this::node).toList());
    }

    BundleExportTypes.Job job(BundleExportJobs.View job) {
        return new BundleExportTypes.Job(
                job.id(),
                job.releaseId(),
                job.status(),
                job.attempts(),
                job.error(),
                job.traceId(),
                job.createdAt(),
                job.expiresAt(),
                job.bytes());
    }
}
