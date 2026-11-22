package io.edition.control.usecases.resource;

import io.edition.content.*;
import io.edition.control.modules.contenttype.api.ContentTypeApi;
import io.edition.control.usecases.flow.*;
import io.edition.control.usecases.flow.ProblemCode;
import io.edition.shared.*;
import java.util.*;
import org.springframework.stereotype.Component;

/** Server-owned resolution of content identity; HTTP callers cannot supply frozen definitions. */
@Component
public class ContentTypes {
    private final ContentTypeApi types;
    private final io.edition.control.modules.page.api.PageApi workingPages;

    public ContentTypes(ContentTypeApi types, io.edition.control.modules.page.api.PageApi pages) {
        this.workingPages = pages;
        this.types = types;
    }

    public ContentProfile bind(String format, ContentProfile requested, ContentProfile previous) {
        if (requested == null && previous != null) return previous;
        var profile = requested == null ? ContentProfile.defaults(format) : requested;
        boolean same = previous != null
                && previous.contentType().equals(profile.contentType())
                && (profile.versionRef() == null || Objects.equals(profile.versionRef(), previous.versionRef()));
        String reference = same ? previous.versionRef() : profile.versionRef();
        if (!same && reference == null)
            reference = types.state(profile.contentType())
                    .orElseThrow(() -> new Invalid("contentType", "unregistered_type"))
                    .activeVersionRef();
        var definition = resolve(profile.contentType(), reference, !same);
        if (!definition.definition().format().equalsIgnoreCase(format))
            throw new Invalid("contentType", "content_format_mismatch");
        Map<String, Object> settings = profile.interpretation();
        if (!same) {
            var initial = new LinkedHashMap<>(definition.definition().defaultInterpretation());
            initial.putAll(settings);
            settings = initial;
        }
        return new ContentProfile(profile.contentType(), same ? reference : definition.versionRef(), settings);
    }

    public ContentProfile restore(ContentProfile historical, ContentProfile current) {
        var target = freeze(historical);
        boolean same = current.contentType().equals(historical.contentType())
                && Objects.equals(freeze(current).versionRef(), target.versionRef());
        if (!same) resolve(historical.contentType(), historical.versionRef(), true);
        return historical;
    }

    public ContentTypeSnapshot freeze(ContentProfile profile) {
        return resolve(profile.contentType(), profile.versionRef(), false);
    }

    public io.edition.control.modules.release.api.ReleaseApi.Bundle imported(
            io.edition.control.modules.release.api.ReleaseApi.Bundle bundle) {
        var pages = bundle.pages().stream()
                .map(page -> {
                    var profile = page.contentProfile();
                    var incoming = page.contentTypeDefinition();
                    ContentTypeSnapshot snapshot;
                    if (incoming == null) snapshot = resolve(profile.contentType(), profile.versionRef(), false);
                    else {
                        var version = types.matching(profile.contentType(), incoming.digest())
                                .orElseThrow(() ->
                                        new Invalid("contentTypeDefinition", "administrator_registration_required"));
                        snapshot = resolve(profile.contentType(), version.versionRef(), false);
                    }
                    var previous = workingPages
                            .view(new io.edition.control.modules.page.api.PageApi.PageId(page.pageId()))
                            .map(io.edition.control.modules.page.api.PageApi.View::contentProfile);
                    final String selected = snapshot.versionRef();
                    boolean same = previous.filter(p -> p.contentType().equals(profile.contentType()))
                            .map(p -> Objects.equals(freeze(p).versionRef(), selected))
                            .orElse(false);
                    if (!same) snapshot = resolve(profile.contentType(), snapshot.versionRef(), true);
                    return new io.edition.control.modules.release.api.ReleaseApi.PageSnapshot(
                            page.pageId(),
                            page.slug(),
                            page.title(),
                            page.format(),
                            page.content(),
                            page.contentPath(),
                            page.seo(),
                            page.icon(),
                            page.properties(),
                            page.externalId(),
                            page.attachments(),
                            page.seq(),
                            profile.bind(snapshot.versionRef()),
                            snapshot);
                })
                .toList();
        return new io.edition.control.modules.release.api.ReleaseApi.Bundle(
                bundle.bundleVersion(),
                bundle.generator(),
                bundle.generatedAt(),
                pages,
                bundle.toc(),
                bundle.checksums());
    }

    private ContentTypeSnapshot resolve(String type, String reference, boolean enabled) {
        try {
            return types.resolve(type, reference, enabled);
        } catch (ContentTypeApi.Missing e) {
            throw new Invalid("versionRef", "unregistered_version");
        } catch (ContentTypeApi.Invalid e) {
            throw new Invalid(e.field, e.reason);
        }
    }

    public static final class Invalid extends FlowException {
        public Invalid(String field, String code) {
            super(ProblemCode.VALIDATION_FAILED, List.of(new ValidationViolation(field, code)));
        }
    }
}
