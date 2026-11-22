package io.edition.control.usecases.releases.bundleimport;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

import io.edition.control.modules.objectstore.api.ObjectStoreApi;
import io.edition.control.modules.page.api.PageApi;
import io.edition.control.modules.release.api.ReleaseApi;
import io.edition.control.modules.revision.api.RevisionApi;
import io.edition.control.modules.space.api.SpaceApi;
import io.edition.control.modules.toc.api.TocApi;
import java.io.ByteArrayInputStream;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;

class ImportedWorkspaceMirrorTest {
    @Test
    void sameBytesCanBackDistinctReferencesAndRenamingOnePreservesTheOthers() {
        var pages = mock(PageApi.class);
        var spaces = mock(SpaceApi.class);
        var toc = mock(TocApi.class);
        var objects = mock(ObjectStoreApi.class);
        var mirror = new ImportedWorkspaceMirror(pages, spaces, toc, mock(RevisionApi.class), objects);

        var space = UUID.randomUUID();
        var page = new PageApi.PageId(UUID.randomUUID());
        var actor = PageApi.Actor.system();
        var now = Instant.now();
        var storageKey = "a".repeat(64);
        var retained = new PageApi.Attachment(UUID.randomUUID(), "keep.png", "image/png", 8, storageKey, now);
        var obsolete = new PageApi.Attachment(UUID.randomUUID(), "old.png", "image/png", 8, storageKey, now);

        var current = mock(PageApi.View.class);
        when(current.id()).thenReturn(page.value());
        when(current.title()).thenReturn("Guide");
        when(current.status()).thenReturn(PageApi.Status.PUBLISHED);
        when(current.properties()).thenReturn(Map.of());
        when(current.attachments()).thenReturn(List.of(retained, obsolete));
        when(pages.views(Set.of(page))).thenReturn(List.of(current));
        when(pages.view(page)).thenReturn(Optional.of(current));
        when(spaces.reslug(eq(new SpaceApi.SpaceId(space)), eq(page.value()), any()))
                .thenReturn(new SpaceApi.PlacementResult.Placed(null));
        when(toc.replace(new TocApi.TocId(space), List.of())).thenReturn(new TocApi.ReplaceResult.Replaced(List.of()));
        when(objects.open(storageKey)).thenAnswer(ignored -> Optional.of(new ByteArrayInputStream(new byte[8])));
        when(pages.attach(eq(page), any(), eq(actor))).thenReturn(new PageApi.AttachResult.Attached(current, null));

        var snapshot = mock(ReleaseApi.PageSnapshot.class);
        when(snapshot.pageId()).thenReturn(page.value());
        when(snapshot.title()).thenReturn("Guide");
        when(snapshot.slug()).thenReturn("guide.md");
        when(snapshot.attachments())
                .thenReturn(List.of(
                        new ReleaseApi.AttachmentRef("attachments/keep.png", storageKey, storageKey),
                        new ReleaseApi.AttachmentRef("attachments/new.png", storageKey, storageKey),
                        new ReleaseApi.AttachmentRef("attachments/extra.png", storageKey, storageKey)));
        var bundle = new ReleaseApi.Bundle("1.0", "test", now, List.of(snapshot), List.of(), Map.of());

        mirror.mirrorReleaseIntoWorkspace(space, bundle, Set.of());

        var files = ArgumentCaptor.forClass(PageApi.FileUpload.class);
        var writes = inOrder(pages);
        writes.verify(pages).detach(page, obsolete.ref(), actor);
        writes.verify(pages, times(2)).attach(eq(page), files.capture(), eq(actor));
        assertEquals(
                List.of("new.png", "extra.png"),
                files.getAllValues().stream().map(PageApi.FileUpload::filename).toList());
        verify(pages, never()).detach(page, retained.ref(), actor);
    }
}
