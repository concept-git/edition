package io.space.control.compositions.authoring.pageediting;

import static io.space.control.compositions.authoring.pageediting.PageEditingTypes.*;

import io.space.concepts.page.api.PageApi;
import io.space.concepts.revision.api.RevisionApi;
import io.space.control.compositions.principal.PrincipalResolver.Resolution;
import io.space.control.compositions.resource.PageNotFoundException;
import java.util.UUID;

@org.springframework.stereotype.Service
public class EditAndRecordOnCompletion {

    private final PageApi pages;

    private final RevisionApi revisions;

    private final PageAccess access;

    EditAndRecordOnCompletion(PageEditingDependencies dependencies) {
        this.pages = dependencies.pages;
        this.revisions = dependencies.revisions;
        this.access = dependencies.access;
    }

    private PageApi.View editAndRecord(
            UUID page,
            String content,
            int baseRevision,
            Resolution resolution,
            String note,
            io.space.content.ContentProfile profile) {
        PageApi.View edited =
                switch (pages.edit(
                        new PageApi.PageId(page), content, baseRevision, access.pageActor(resolution), profile)) {
                    case PageApi.EditResult.Edited value -> value.page();
                    case PageApi.EditResult.Conflict value ->
                        throw new EditConflictException(
                                value.theirs().content(),
                                value.theirs().revision(),
                                value.theirs().contentProfile());
                    case PageApi.EditResult.NotFound ignored -> throw new PageNotFoundException();
                    case PageApi.EditResult.ContentTooLarge ignored -> throw new PageContentTooLargeException();
                };
        revisions.record(
                new RevisionApi.ItemId(page),
                edited.revision(),
                edited.content(),
                access.revisionActor(resolution),
                note,
                edited.contentProfile());
        return edited;
    }

    @org.springframework.context.event.EventListener
    public void editAndRecord(PageEditingSignals.EditAndRecord binding) {
        if (!binding.completion().claim("editAndRecord")) return;
        binding.completion()
                .complete(editAndRecord(
                        binding.page(),
                        binding.content(),
                        binding.baseRevision(),
                        binding.resolution(),
                        binding.note(),
                        binding.profile()));
    }
}
