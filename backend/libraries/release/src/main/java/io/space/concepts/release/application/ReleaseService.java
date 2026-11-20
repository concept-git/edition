package io.space.concepts.release.application;

import io.space.concepts.release.api.*;
import io.space.concepts.release.api.ReleaseApi;
import io.space.concepts.release.api.ReleaseEvents;
import io.space.concepts.release.domain.BundleRules;
import io.space.concepts.release.domain.Release;
import io.space.concepts.release.domain.ReleaseRepository;
import io.space.concepts.release.validation.ContentValidation;
import io.space.content.ContentProfile;
import io.space.shared.KeysetCursor;
import io.space.shared.PageWindow;
import java.time.Clock;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
class ReleaseService implements ReleaseApi {
    private final ReleaseRepository repository;
    private final ApplicationEventPublisher events;
    private final Clock clock;

    ReleaseService(ReleaseRepository repository, ApplicationEventPublisher events, Clock clock) {
        this.repository = repository;
        this.events = events;
        this.clock = clock;
    }

    @Override
    @Transactional(readOnly = true)
    public List<Issue> inspectContent(String format, String content, ContentProfile profile) {
        return ContentValidation.inspect(format, content, profile);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Issue> inspectContent(
            String format, String content, ContentProfile profile, io.space.content.ContentTypeDefinition definition) {
        return ContentValidation.inspect(format, content, profile, definition);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Issue> inspectDefinition(io.space.content.ContentTypeDefinition definition) {
        return ContentValidation.inspectDefinition(definition);
    }

    @Override
    public View draft(ScopeId scope, Source source) {
        int next = repository.count(scope) + 1;
        var created = repository.insert(scope.value(), source, Integer.toString(next));
        events.publishEvent(new ReleaseEvents.Drafted(created.view()));
        return created.view();
    }

    @Override
    public LoadResult load(ReleaseId rel, Bundle bundle) {
        var current = repository.lock(rel);
        if (current.isEmpty()) return new LoadResult.NotFound();
        Release release = current.orElseThrow();
        release.requireLoadable();
        if (repository.hasSnapshot(rel)) throw new IllegalStateException("load at most once");
        Report loadReport = BundleRules.loadIssues(bundle);
        if (loadReport.blocking()) {
            release.recordLoadReport(loadReport);
            var saved = repository.save(release);
            return new LoadResult.InvalidBundle(saved.view(), loadReport);
        }
        repository.insertSnapshot(rel, bundle);
        release.markLoaded(bundle.pages().size());
        var saved = repository.save(release);
        events.publishEvent(new ReleaseEvents.Loaded(saved.view()));
        return new LoadResult.Loaded(saved.view());
    }

    @Override
    public ValidateResult validate(ReleaseId rel, List<CoverageWarning> coverageWarnings, List<Issue> extraBlocking) {
        var current = repository.lock(rel);
        if (current.isEmpty()) return new ValidateResult.NotFound();
        Release release = current.orElseThrow();
        release.requireValidatable();
        Bundle bundle = repository.snapshot(rel).orElseThrow(() -> new IllegalStateException("validate requires load"));
        List<CoverageWarning> overlays = coverageWarnings == null ? List.of() : List.copyOf(coverageWarnings);
        Report intrinsic = BundleRules.validateIssues(bundle);
        List<Issue> errors = new ArrayList<>(intrinsic.errors());
        for (PageSnapshot page : bundle.pages()) {
            List<Issue> contentIssues = page.contentTypeDefinition() == null
                    ? inspectContent(page.format().name(), page.content(), page.contentProfile())
                    : inspectContent(
                            page.format().name(),
                            page.content(),
                            page.contentProfile(),
                            page.contentTypeDefinition().definition());
            for (Issue issue : contentIssues) {
                errors.add(new Issue(issue.code(), page.slug() + issue.path(), page.pageId(), issue.detail()));
            }
        }
        if (extraBlocking != null) errors.addAll(extraBlocking);
        if (!errors.isEmpty()) {
            Report blocking = new Report(List.copyOf(errors), List.of(), intrinsic.info());
            release.recordErrors(blocking);
            var saved = repository.save(release).view();
            events.publishEvent(new ReleaseEvents.ValidationRejected(saved));
            return new ValidateResult.Errors(saved, blocking);
        }
        List<Issue> warnings = overlays.stream()
                .map(item -> new Issue("hotfix_overlay", item.externalId(), item.pageId(), null))
                .toList();
        Report report = new Report(List.of(), warnings, intrinsic.info());
        if (!warnings.isEmpty()) {
            release.markFlagged(report);
            var saved = repository.save(release);
            events.publishEvent(new ReleaseEvents.Flagged(saved.view()));
            return new ValidateResult.Warnings(saved.view(), report);
        }
        release.markValidated(report);
        var saved = repository.save(release);
        events.publishEvent(new ReleaseEvents.Validated(saved.view()));
        return new ValidateResult.Ok(saved.view());
    }

    @Override
    public MutationResult approve(ReleaseId rel) {
        var current = repository.lock(rel);
        if (current.isEmpty()) return new MutationResult.NotFound();
        current.orElseThrow().approve();
        return new MutationResult.Changed(repository.save(current.orElseThrow()).view());
    }

    @Override
    public MutationResult promote(ReleaseId rel) {
        var existing = repository.find(rel);
        if (existing.isEmpty()) return new MutationResult.NotFound();
        ScopeId scope = new ScopeId(existing.orElseThrow().scopeId());
        repository.lockRetention(scope);
        var current = repository.lock(rel);
        if (current.isEmpty()) return new MutationResult.NotFound();
        Release incoming = current.orElseThrow();
        incoming.requirePromotable();
        repository.lockLive(scope).ifPresent(live -> {
            if (!live.id().equals(incoming.id())) {
                live.markArchived();
                repository.save(live);
            }
        });
        incoming.markLive(clock.instant());
        var saved = repository.save(incoming);
        events.publishEvent(new ReleaseEvents.Promoted(saved.view()));
        return new MutationResult.Changed(saved.view());
    }

    @Override
    public MutationResult discard(ReleaseId rel) {
        var current = repository.lock(rel);
        if (current.isEmpty()) return new MutationResult.NotFound();
        current.orElseThrow().requireDiscardable();
        View view = current.orElseThrow().view();
        repository.delete(rel);
        events.publishEvent(new ReleaseEvents.Discarded(rel));
        return new MutationResult.Changed(view);
    }

    @Override
    public Set<ReleaseId> prune(ScopeId scope) {
        repository.lockRetention(scope);
        int keep = repository.keep(scope);
        var pruned = new LinkedHashSet<ReleaseId>();
        for (ReleaseId id : repository.archivedBeyondKeep(scope, keep)) {
            repository.delete(id);
            pruned.add(id);
        }
        repository.recycleOrphanContents();
        return Set.copyOf(pruned);
    }

    @Override
    public boolean pin(ReleaseId rel, java.util.UUID reservation, java.time.Instant until) {
        if (!until.isAfter(clock.instant()))
            throw new IllegalArgumentException("reservation must expire in the future");
        var current = repository.find(rel);
        if (current.isEmpty()) return false;
        repository.lockRetention(new ScopeId(current.orElseThrow().view().scopeId()));
        var locked = repository.lock(rel);
        if (locked.isEmpty()
                || (locked.orElseThrow().view().status() != Status.LIVE
                        && locked.orElseThrow().view().status() != Status.ARCHIVED)) return false;
        repository.pin(rel, reservation, until);
        return true;
    }

    @Override
    public Optional<Bundle> export(ReleaseId rel) {
        return repository.snapshot(rel);
    }

    @Override
    public MutationResult setRetention(ScopeId scope, int keep) {
        if (keep < MIN_KEEP || keep > MAX_KEEP) {
            throw new IllegalArgumentException("keep must be between 1 and 50");
        }
        repository.setKeep(scope, keep);
        return new MutationResult.Changed(live(scope).orElse(null));
    }

    @Override
    public MutationResult setLabel(ReleaseId rel, String label) {
        return updateAnnotations(rel, current -> current.relabel(label));
    }

    @Override
    public MutationResult annotate(ReleaseId rel, String notes) {
        return updateAnnotations(rel, current -> current.annotate(notes));
    }

    private MutationResult updateAnnotations(ReleaseId rel, java.util.function.Consumer<Release> change) {
        var current = repository.lock(rel);
        if (current.isEmpty()) return new MutationResult.NotFound();
        change.accept(current.orElseThrow());
        var saved = repository.save(current.orElseThrow());
        events.publishEvent(new ReleaseEvents.Annotated(saved.view()));
        return new MutationResult.Changed(saved.view());
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<View> live(ScopeId scope) {
        return repository.live(scope).map(Release::view);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<PageSnapshot> pageOf(ReleaseId rel, UUID page) {
        return repository.page(rel, page);
    }

    @Override
    @Transactional(readOnly = true)
    public List<PageHeader> pagesOf(ReleaseId rel) {
        return repository.pageHeaders(rel);
    }

    @Override
    @Transactional(readOnly = true)
    public List<TocNode> tocOf(ReleaseId rel) {
        return repository.toc(rel);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<ScopeId> scopeOf(ReleaseId rel) {
        return repository.find(rel).map(item -> new ScopeId(item.scopeId()));
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<Status> status(ReleaseId rel) {
        return repository.find(rel).map(Release::status);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<Delta> diff(ReleaseId left, ReleaseId right) {
        var leftPrints = index(repository.fingerprints(left));
        var rightPrints = index(repository.fingerprints(right));
        if (!repository.find(left).isPresent() || !repository.find(right).isPresent()) {
            return Optional.empty();
        }
        Set<UUID> added = new HashSet<>(rightPrints.keySet());
        added.removeAll(leftPrints.keySet());
        Set<UUID> removed = new HashSet<>(leftPrints.keySet());
        removed.removeAll(rightPrints.keySet());
        Set<UUID> changed = new HashSet<>();
        for (UUID page : rightPrints.keySet()) {
            if (leftPrints.containsKey(page) && !leftPrints.get(page).equals(rightPrints.get(page))) {
                changed.add(page);
            }
        }
        return Optional.of(new Delta(added, changed, removed));
    }

    @Override
    @Transactional(readOnly = true)
    public List<View> list(ScopeId scope) {
        return repository.list(scope).stream().map(Release::view).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public Page page(Set<ScopeId> scopes, Optional<Status> status, String cursor, int limit) {
        if (limit < 1 || limit > 100) throw new IllegalArgumentException("limit must be between 1 and 100");
        Optional<KeysetCursor> before = KeysetCursor.decode(cursor);
        if (scopes.isEmpty()) return new Page(List.of(), null);
        List<Release> rows = repository.page(
                scopes,
                status.orElse(null),
                before.map(KeysetCursor::at).orElse(null),
                before.map(KeysetCursor::id).orElse(null),
                limit + 1);
        var window = PageWindow.of(
                rows,
                limit,
                row -> KeysetCursor.encode(row.view().createdAt(), row.view().id()));
        return new Page(window.items().stream().map(Release::view).toList(), window.nextCursor());
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<View> lastOf(ScopeId scope, SourceKind kind) {
        return repository.lastOf(scope, kind).map(Release::view);
    }

    @Override
    @Transactional(readOnly = true)
    public int keep(ScopeId scope) {
        return repository.keep(scope);
    }

    private static Map<UUID, String> index(List<ReleaseRepository.PageFingerprint> fingerprints) {
        Map<UUID, String> map = new HashMap<>();
        for (var item : fingerprints) map.put(item.pageId(), item.contentHash());
        return map;
    }

    @Override
    public void terminateScope(ScopeId scope) {
        repository.lockRetention(scope);
        repository.terminateScope(scope);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean referencesPage(UUID pageId) {
        return repository.referencesPage(pageId);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean referencesObject(String key) {
        return repository.referencesObject(key);
    }

    @Override
    @Transactional(readOnly = true)
    public java.util.Set<String> objectKeys(ScopeId scope) {
        return repository.objectKeys(scope);
    }

    @Override
    @Transactional(readOnly = true)
    public Usage usage(ScopeId scope) {
        return repository.usage(scope);
    }
}
