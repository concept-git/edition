package io.edition.control.compositions.authoring.pageediting;

import io.edition.concepts.page.api.PageApi;
import io.edition.concepts.release.api.ReleaseApi;
import io.edition.control.compositions.resource.InvalidBundleException;
import java.time.Clock;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.springframework.stereotype.Component;

/** live 快照覆盖本页正文；热修 source.kind=build，不跑 mirror。 */
@Component
public class HotfixSnapshots {
    private final ReleaseApi releases;
    private final Clock clock;
    private final io.edition.control.compositions.resource.ContentTypes contentTypes;

    HotfixSnapshots(
            ReleaseApi releases, Clock clock, io.edition.control.compositions.resource.ContentTypes contentTypes) {
        this.contentTypes = contentTypes;
        this.releases = releases;
        this.clock = clock;
    }

    public void promote(UUID space, PageApi.View page, UUID actorId) {
        ReleaseApi.ScopeId scope = new ReleaseApi.ScopeId(space);
        ReleaseApi.View live =
                releases.live(scope).orElseThrow(() -> new IllegalStateException("hotfix requires a live release"));
        ReleaseApi.Bundle overlay = overlay(live.id(), page);
        ReleaseApi.View drafted = releases.draft(
                scope,
                new ReleaseApi.Source(ReleaseApi.SourceKind.BUILD, page.id().toString(), actorId));
        ReleaseApi.ReleaseId id = new ReleaseApi.ReleaseId(drafted.id());
        ReleaseApi.LoadResult loaded = releases.load(id, overlay);
        if (loaded instanceof ReleaseApi.LoadResult.InvalidBundle) {
            releases.discard(id);
            throw new InvalidBundleException();
        }
        ReleaseApi.ValidateResult validated = releases.validate(id, List.of());
        if (validated instanceof ReleaseApi.ValidateResult.Errors) {
            throw new InvalidBundleException();
        }
        releases.promote(id);
        releases.prune(scope);
    }

    private ReleaseApi.Bundle overlay(UUID liveId, PageApi.View edited) {
        ReleaseApi.Bundle live = releases.export(new ReleaseApi.ReleaseId(liveId))
                .orElseThrow(() -> new IllegalStateException("live snapshot missing"));
        List<ReleaseApi.PageSnapshot> pages = new ArrayList<>(live.pages().size());
        Map<String, String> checksums = new LinkedHashMap<>(live.checksums());
        boolean found = false;
        for (ReleaseApi.PageSnapshot page : live.pages()) {
            if (!page.pageId().equals(edited.id())) {
                pages.add(page);
                continue;
            }
            found = true;
            ReleaseApi.PageSnapshot next = new ReleaseApi.PageSnapshot(
                    page.pageId(),
                    page.slug(),
                    page.title(),
                    page.format(),
                    edited.content(),
                    page.contentPath(),
                    page.seo(),
                    page.icon(),
                    page.properties(),
                    page.externalId(),
                    page.attachments(),
                    page.seq(),
                    edited.contentProfile(),
                    contentTypes.freeze(edited.contentProfile()));
            pages.add(next);
            checksums.put(ReleaseApi.contentPath(next), ReleaseApi.checksum(next.content()));
        }
        if (!found) throw new IllegalStateException("hotfix page is not in the live snapshot");
        return new ReleaseApi.Bundle(
                ReleaseApi.BUNDLE_VERSION, ReleaseApi.GENERATOR, clock.instant(), pages, live.toc(), checksums);
    }
}
