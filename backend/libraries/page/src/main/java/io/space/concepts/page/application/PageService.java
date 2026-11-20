package io.space.concepts.page.application;

import io.space.concepts.page.api.*;
import io.space.concepts.page.api.PageApi;
import io.space.concepts.page.api.PageEvents;
import io.space.concepts.page.domain.AttachmentFile;
import io.space.concepts.page.domain.Page;
import io.space.concepts.page.domain.PageRepository;
import io.space.concepts.page.domain.PageTitle;
import io.space.shared.KeysetCursor;
import io.space.shared.PageWindow;
import java.time.Clock;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.function.Consumer;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
class PageService implements PageApi {
    private final PageRepository repository;
    private final ApplicationEventPublisher events;
    private final Clock clock;

    PageService(PageRepository repository, ApplicationEventPublisher events, Clock clock) {
        this.repository = repository;
        this.events = events;
        this.clock = clock;
    }

    @Override
    public CreateResult create(Actor actor, Format format, String title) {
        return create(actor, format, title, (io.space.content.ContentProfile) null);
    }

    @Override
    public CreateResult create(Actor actor, Format format, String title, io.space.content.ContentProfile profile) {
        final PageTitle parsedTitle;
        try {
            parsedTitle = new PageTitle(title);
        } catch (PageTitle.Invalid invalid) {
            return new CreateResult.InvalidTitle();
        }
        var created = repository.insert(parsedTitle, format, actor, profile).view();
        events.publishEvent(new PageEvents.Created(actor, created));
        return new CreateResult.Created(created);
    }

    @Override
    public CreateResult create(Actor actor, Format format, String title, PageId id) {
        Objects.requireNonNull(id, "page id");
        final PageTitle parsedTitle;
        try {
            parsedTitle = new PageTitle(title);
        } catch (PageTitle.Invalid invalid) {
            return new CreateResult.InvalidTitle();
        }
        var created = repository.insert(parsedTitle, format, actor, id.value());
        if (created.isEmpty()) return new CreateResult.IdTaken();
        var view = created.orElseThrow().view();
        events.publishEvent(new PageEvents.Created(actor, view));
        return new CreateResult.Created(view);
    }

    @Override
    public CreateContentResult create(Actor actor, Format format, String title, PageId id, InitialContent initial) {
        final Page page;
        try {
            page = Page.initial(id.value(), new PageTitle(title), format, initial, actor, clock.instant());
        } catch (PageTitle.Invalid invalid) {
            return new CreateContentResult.InvalidTitle();
        } catch (Page.ContentTooLarge invalid) {
            return new CreateContentResult.ContentTooLarge();
        } catch (Page.InvalidField invalid) {
            return new CreateContentResult.Invalid(invalid.field(), invalid.code());
        }
        var created = repository.insert(page);
        if (created.isEmpty()) return new CreateContentResult.IdTaken();
        var view = created.orElseThrow().view();
        events.publishEvent(new PageEvents.Created(actor, view));
        events.publishEvent(new PageEvents.Edited(actor, view));
        return new CreateContentResult.Created(view);
    }

    @Override
    public EditResult edit(PageId page, String content, int baseRevision, Actor actor) {
        return edit(page, content, baseRevision, actor, null);
    }

    @Override
    public EditResult edit(
            PageId page, String content, int baseRevision, Actor actor, io.space.content.ContentProfile profile) {
        var current = repository.lock(page);
        if (current.isEmpty()) return new EditResult.NotFound();
        try {
            current.orElseThrow().edit(content, baseRevision, actor, profile);
            var saved = repository.save(current.orElseThrow()).view();
            events.publishEvent(new PageEvents.Edited(actor, saved));
            return new EditResult.Edited(saved);
        } catch (Page.EditConflict conflict) {
            return new EditResult.Conflict(current.orElseThrow().view());
        } catch (Page.ContentTooLarge invalid) {
            return new EditResult.ContentTooLarge();
        }
    }

    @Override
    public MutationResult rename(PageId page, String title, Actor actor) {
        var current = repository.lock(page);
        if (current.isEmpty()) return new MutationResult.NotFound();
        try {
            current.orElseThrow().rename(new PageTitle(title), actor);
        } catch (PageTitle.Invalid invalid) {
            return new MutationResult.InvalidTitle();
        }
        var saved = repository.save(current.orElseThrow()).view();
        events.publishEvent(new PageEvents.Renamed(actor, saved));
        return new MutationResult.Changed(saved);
    }

    @Override
    public MetadataResult setSeo(PageId page, SeoPatch patch, Actor actor) {
        return metadata(page, actor, current -> current.setSeo(patch, actor));
    }

    @Override
    public MetadataResult setIcon(PageId page, String icon, Actor actor) {
        return metadata(page, actor, current -> current.setIcon(icon, actor));
    }

    @Override
    public MetadataResult setProperty(PageId page, String field, String value, Actor actor) {
        return metadata(page, actor, current -> current.setProperty(field, value, actor));
    }

    @Override
    public MetadataResult replaceProperties(PageId page, java.util.Map<String, String> values, Actor actor) {
        return metadata(page, actor, current -> current.replaceProperties(values, actor));
    }

    @Override
    public MetadataResult removeProperty(PageId page, String field, Actor actor) {
        return metadata(page, actor, current -> current.removeProperty(field, actor));
    }

    private MetadataResult metadata(PageId page, Actor actor, Consumer<Page> mutation) {
        var current = repository.lock(page);
        if (current.isEmpty()) return new MetadataResult.NotFound();
        try {
            mutation.accept(current.orElseThrow());
        } catch (Page.InvalidField invalid) {
            return new MetadataResult.Invalid(invalid.field(), invalid.code());
        }
        var saved = repository.save(current.orElseThrow()).view();
        events.publishEvent(new PageEvents.MetadataChanged(actor, saved));
        return new MetadataResult.Changed(saved);
    }

    @Override
    public AttachResult attach(PageId page, FileUpload file, Actor actor) {
        var current = repository.lock(page);
        if (current.isEmpty()) return new AttachResult.NotFound();
        final Attachment attachment;
        try {
            attachment = current.orElseThrow().attach(file, actor, clock.instant());
        } catch (AttachmentFile.FileTooLarge tooLarge) {
            return new AttachResult.FileTooLarge();
        } catch (AttachmentFile.FileTypeUnsupported unsupported) {
            return new AttachResult.FileTypeUnsupported();
        } catch (Page.TooManyAttachments tooMany) {
            return new AttachResult.TooManyAttachments();
        } catch (AttachmentFile.FilenameInvalid invalid) {
            return new AttachResult.Invalid("filename", "invalid_format");
        }
        repository.addAttachment(page.value(), attachment, actor);
        var saved = repository.save(current.orElseThrow()).view();
        events.publishEvent(new PageEvents.Attached(actor, saved, attachment));
        return new AttachResult.Attached(saved, attachment);
    }

    @Override
    public MetadataResult detach(PageId page, UUID ref, Actor actor) {
        var current = repository.lock(page);
        if (current.isEmpty()) return new MetadataResult.NotFound();
        var removed = current.orElseThrow().detach(ref, actor);
        if (removed.isEmpty())
            return new MetadataResult.Changed(current.orElseThrow().view());
        repository.removeAttachment(page.value(), ref);
        var saved = repository.save(current.orElseThrow()).view();
        events.publishEvent(new PageEvents.Detached(actor, saved, ref));
        return new MetadataResult.Changed(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<View> view(PageId page) {
        return repository.find(page).map(Page::view);
    }

    @Override
    @Transactional(readOnly = true)
    public List<View> views(Set<PageId> pages) {
        return repository.findAll(pages).stream().map(Page::view).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public Slice page(String cursor, int limit, Optional<Status> status, Optional<Format> format) {
        return pageSlice(cursor, limit, status, format, false);
    }

    @Override
    @Transactional(readOnly = true)
    public Slice pageAll(String cursor, int limit) {
        return pageSlice(cursor, limit, Optional.empty(), Optional.empty(), true);
    }

    private Slice pageSlice(
            String cursor, int limit, Optional<Status> status, Optional<Format> format, boolean includeTrashed) {
        if (limit < 1 || limit > 100) throw new IllegalArgumentException("limit must be between 1 and 100");
        Optional<KeysetCursor> before = KeysetCursor.decode(cursor);
        var rows = repository.page(
                before.map(KeysetCursor::at).orElse(null),
                before.map(KeysetCursor::id).orElse(null),
                limit + 1,
                status.orElse(null),
                format.orElse(null),
                includeTrashed);
        var window = PageWindow.of(
                rows,
                limit,
                row -> KeysetCursor.encode(row.view().updatedAt(), row.view().id()));
        return new Slice(window.items().stream().map(Page::view).toList(), window.nextCursor());
    }

    @Override
    @Transactional(readOnly = true)
    public AttachmentScan scanAttachments(String cursor, int limit, String q, String type) {
        if (limit < 1 || limit > 100) throw new IllegalArgumentException("attachment scan limit");
        var before = KeysetCursor.decode(cursor);
        var rows = repository.attachmentCandidates(
                before.map(KeysetCursor::at).orElse(null),
                before.map(KeysetCursor::id).orElse(null),
                limit,
                q,
                type);
        String next = rows.size() == limit
                ? KeysetCursor.encode(
                        rows.getLast().entry().createdAt(),
                        rows.getLast().entry().ref())
                : null;
        return new AttachmentScan(
                rows.stream()
                        .filter(PageRepository.AttachmentCandidate::matches)
                        .map(PageRepository.AttachmentCandidate::entry)
                        .toList(),
                rows.size(),
                next);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<Attachment> attachment(PageId page, UUID ref) {
        return repository.find(page).flatMap(current -> current.attachment(ref));
    }

    @Override
    public Optional<LifecycleChange> trash(PageId page, Actor actor) {
        var current = repository.lock(page);
        if (current.isEmpty()) return Optional.empty();
        boolean changed = current.orElseThrow().trash(clock.instant(), actor);
        var saved = changed
                ? repository.save(current.orElseThrow()).view()
                : current.orElseThrow().view();
        if (changed) events.publishEvent(new PageEvents.Trashed(actor, saved));
        return Optional.of(new LifecycleChange(saved, changed));
    }

    @Override
    public Optional<LifecycleChange> restore(PageId page, Actor actor) {
        var current = repository.lock(page);
        if (current.isEmpty()) return Optional.empty();
        boolean changed = current.orElseThrow().restore(actor);
        var saved = changed
                ? repository.save(current.orElseThrow()).view()
                : current.orElseThrow().view();
        if (changed) events.publishEvent(new PageEvents.Restored(actor, saved));
        return Optional.of(new LifecycleChange(saved, changed));
    }

    @Override
    public Optional<View> publish(PageId page, Actor actor) {
        return toggleStatus(page, actor, true);
    }

    @Override
    public Optional<View> unpublish(PageId page, Actor actor) {
        return toggleStatus(page, actor, false);
    }

    private Optional<View> toggleStatus(PageId page, Actor actor, boolean publish) {
        var current = repository.lock(page);
        if (current.isEmpty()) return Optional.empty();
        boolean changed = publish
                ? current.orElseThrow().publish(actor)
                : current.orElseThrow().unpublish(actor);
        var saved = changed
                ? repository.save(current.orElseThrow()).view()
                : current.orElseThrow().view();
        if (changed) {
            events.publishEvent(
                    publish ? new PageEvents.Published(actor, saved) : new PageEvents.Unpublished(actor, saved));
        }
        return Optional.of(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public Slice trashed(String cursor, int limit) {
        if (limit < 1 || limit > 100) throw new IllegalArgumentException("limit must be between 1 and 100");
        Optional<KeysetCursor> before = KeysetCursor.decode(cursor);
        var rows = repository.trashed(
                before.map(KeysetCursor::at).orElse(null),
                before.map(KeysetCursor::id).orElse(null),
                limit + 1);
        var window = PageWindow.of(
                rows,
                limit,
                row -> KeysetCursor.encode(row.view().trashedAt(), row.view().id()));
        return new Slice(window.items().stream().map(Page::view).toList(), window.nextCursor());
    }

    @Override
    public Optional<View> lock(PageId page) {
        return repository.lock(page).map(Page::view);
    }

    @Override
    public boolean purge(PageId page, java.time.Duration retention) {
        if (retention.isNegative()) throw new IllegalArgumentException("negative retention");
        var current = repository.lock(page);
        if (current.isEmpty()) return false;
        var view = current.orElseThrow().view();
        if (view.trashedAt() == null
                || !view.trashedAt().isBefore(clock.instant().minus(retention))) return false;
        repository.delete(page);
        events.publishEvent(new PageEvents.Purged(page.value()));
        return true;
    }

    @Override
    public void terminate(PageId page) {
        if (repository.lock(page).isEmpty()) return;
        repository.delete(page);
        events.publishEvent(new PageEvents.Purged(page.value()));
    }

    @Override
    @Transactional(readOnly = true)
    public boolean referencesObject(String key) {
        return repository.referencesObject(key);
    }

    @Override
    @Transactional(readOnly = true)
    public List<PageId> expired(java.time.Instant before, UUID after, int limit) {
        if (limit < 1 || limit > 1000) throw new IllegalArgumentException("invalid limit");
        return repository.expired(before, after, limit).stream()
                .map(PageId::new)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public Usage usage(Set<UUID> ids) {
        return repository.usage(ids);
    }
}
