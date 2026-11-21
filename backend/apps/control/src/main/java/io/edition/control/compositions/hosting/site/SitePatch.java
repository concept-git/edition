package io.edition.control.compositions.hosting.site;

import io.edition.concepts.site.api.SiteApi;
import io.edition.control.compositions.flow.IdempotentFlowExecutor;
import java.util.Locale;
import java.util.Optional;
import java.util.UUID;
import java.util.regex.Pattern;

/** Site 补丁归一、品牌/TDK 校验与创建改名的名字校验。 */
public final class SitePatch {
    private static final Pattern LOCALE = Pattern.compile("[A-Za-z]{1,8}(?:-[A-Za-z0-9]{1,8})*");
    private static final Pattern ANALYTICS = Pattern.compile("[A-Za-z0-9._-]+");
    private static final Pattern COLOR = Pattern.compile("#[0-9a-f]{6}");

    private SitePatch() {}

    static SiteApi.View create(SiteApi sites, SiteApi.ActorId actor, UUID tenant, String name) {
        try {
            return sites.create(actor, tenant, name);
        } catch (IllegalArgumentException ignored) {
            throw new SiteNameInvalidException();
        }
    }

    static NormalizedPatch normalize(SiteTypes.UpdatePatch patch) {
        if (patch == null || patch.empty()) throw new SitePatchInvalidException();
        return new NormalizedPatch(
                name(patch.name()),
                string(patch.titleTemplate(), SitePatch::titleTemplate),
                branding(patch.branding()),
                string(patch.locale(), SitePatch::locale),
                string(patch.analyticsId(), SitePatch::analytics),
                robots(patch.robotsPolicy()),
                home(patch.home()),
                rule(patch.rule()));
    }

    static SiteApi.View apply(
            SiteApi sites, SiteApi.ActorId actor, UUID site, SiteApi.View current, NormalizedPatch patch) {
        var id = new SiteApi.SiteId(site);
        SiteApi.View view = current;
        if (patch.name() instanceof Change.Set<String> name) {
            view = rename(sites, actor, id, name.value());
        }
        if (patch.titleTemplate() instanceof Change.Set<String> template) {
            view = mutate(sites.setTitleTemplate(actor, id, Optional.of(template.value())));
        } else if (patch.titleTemplate() instanceof Change.Clear<?>) {
            view = mutate(sites.setTitleTemplate(actor, id, Optional.empty()));
        }
        if (patch.locale() instanceof Change.Set<String> locale) {
            view = mutate(sites.setLocale(actor, id, Optional.of(locale.value())));
        } else if (patch.locale() instanceof Change.Clear<?>) {
            view = mutate(sites.setLocale(actor, id, Optional.empty()));
        }
        if (patch.analyticsId() instanceof Change.Set<String> analytics) {
            view = mutate(sites.setAnalytics(actor, id, Optional.of(analytics.value())));
        } else if (patch.analyticsId() instanceof Change.Clear<?>) {
            view = mutate(sites.setAnalytics(actor, id, Optional.empty()));
        }
        if (patch.robotsPolicy() instanceof Change.Set<SiteApi.RobotsPolicy> robots) {
            view = mutate(sites.setRobots(actor, id, robots.value()));
        }
        if (patch.home() instanceof Change.Set<UUID> home) {
            view = home(sites, actor, id, Optional.of(home.value()));
        } else if (patch.home() instanceof Change.Clear<?>) {
            view = home(sites, actor, id, Optional.empty());
        }
        if (patch.rule() instanceof Change.Set<String> rule) {
            view = rule(sites, actor, id, rule.value());
        }
        if (!(patch.branding().logo() instanceof Change.Unchanged<?>)
                || !(patch.branding().favicon() instanceof Change.Unchanged<?>)
                || !(patch.branding().primaryColor() instanceof Change.Unchanged<?>)) {
            view = mutate(sites.setBranding(actor, id, merge(view.branding(), patch.branding())));
        }
        return view;
    }

    static String canonical(NormalizedPatch patch) {
        return IdempotentFlowExecutor.canonical(
                token(patch.name()),
                token(patch.titleTemplate()),
                brandingToken(patch.branding()),
                token(patch.locale()),
                token(patch.analyticsId()),
                token(patch.robotsPolicy()),
                token(patch.home()),
                token(patch.rule()));
    }

    private static SiteApi.View rename(SiteApi sites, SiteApi.ActorId actor, SiteApi.SiteId site, String name) {
        try {
            return mutate(sites.rename(actor, site, name));
        } catch (IllegalArgumentException ignored) {
            throw new SiteNameInvalidException();
        }
    }

    private static SiteApi.View home(SiteApi sites, SiteApi.ActorId actor, SiteApi.SiteId site, Optional<UUID> home) {
        return mutate(sites.setHome(actor, site, home));
    }

    private static SiteApi.View rule(SiteApi sites, SiteApi.ActorId actor, SiteApi.SiteId site, String rule) {
        return mutate(sites.setRule(actor, site, rule));
    }

    private static SiteApi.View mutate(SiteApi.MutationResult result) {
        return SiteResults.changed(result);
    }

    private static Change<String> name(Change<String> patch) {
        return switch (patch) {
            case Change.Unchanged<String> ignored -> patch;
            case Change.Clear<String> ignored -> throw new SiteNameInvalidException();
            case Change.Set<String> set -> {
                String value = set.value() == null ? "" : set.value().strip();
                if (value.isEmpty() || value.length() > 120) throw new SiteNameInvalidException();
                yield new Change.Set<>(value);
            }
        };
    }

    private static Change<String> string(Change<String> patch, java.util.function.Function<String, String> normalize) {
        return switch (patch) {
            case Change.Unchanged<String> ignored -> patch;
            case Change.Clear<String> ignored -> patch;
            case Change.Set<String> set -> {
                if (set.value() == null || set.value().isBlank()) yield new Change.Clear<>();
                yield new Change.Set<>(normalize.apply(set.value()));
            }
        };
    }

    private static String titleTemplate(String value) {
        String stripped = value.strip();
        if (stripped.length() > 120) throw new SitePatchInvalidException("titleTemplate", "size_out_of_range");
        int count = 0;
        for (int index = 0; (index = stripped.indexOf("%s", index)) >= 0; index += 2) count++;
        if (count != 1) throw new SitePatchInvalidException("titleTemplate", "invalid_format");
        return stripped;
    }

    private static String locale(String value) {
        String stripped = value.strip();
        if (stripped.length() > 35 || !LOCALE.matcher(stripped).matches()) {
            throw new SitePatchInvalidException("locale", "invalid_format");
        }
        return stripped;
    }

    private static String analytics(String value) {
        String stripped = value.strip();
        if (stripped.length() > 64 || !ANALYTICS.matcher(stripped).matches()) {
            throw new SitePatchInvalidException("analyticsId", "invalid_format");
        }
        return stripped;
    }

    private static Change<SiteApi.RobotsPolicy> robots(Change<String> patch) {
        return switch (patch) {
            case Change.Unchanged<String> ignored -> new Change.Unchanged<>();
            case Change.Clear<String> ignored -> throw new SitePatchInvalidException("robotsPolicy", "required");
            case Change.Set<String> set -> {
                try {
                    yield new Change.Set<>(
                            SiteApi.RobotsPolicy.parse(set.value().strip().toLowerCase(Locale.ROOT)));
                } catch (IllegalArgumentException | NullPointerException ignored) {
                    throw new SitePatchInvalidException("robotsPolicy", "invalid_format");
                }
            }
        };
    }

    private static Change<UUID> home(Change<UUID> patch) {
        return patch;
    }

    private static Change<String> rule(Change<String> patch) {
        return switch (patch) {
            case Change.Unchanged<String> ignored -> patch;
            case Change.Clear<String> ignored -> throw new SitePatchInvalidException("rule", "required");
            case Change.Set<String> set -> {
                String value = set.value() == null ? "" : set.value().strip();
                if (!SiteApi.DEFAULT_RULE.equals(value)) throw new SitePatchInvalidException("rule", "unsupported");
                yield new Change.Set<>(value);
            }
        };
    }

    private static BrandingChange branding(BrandingChange patch) {
        return new BrandingChange(
                httpsUrl("logo", patch.logo()), httpsUrl("favicon", patch.favicon()), color(patch.primaryColor()));
    }

    private static Change<String> httpsUrl(String field, Change<String> patch) {
        return switch (patch) {
            case Change.Unchanged<String> ignored -> patch;
            case Change.Clear<String> ignored -> patch;
            case Change.Set<String> set -> {
                if (set.value() == null || set.value().isBlank()) yield new Change.Clear<>();
                String value = set.value().strip();
                if (value.length() > 2048
                        || !value.startsWith("https://")
                        || value.regionMatches(true, 0, "javascript:", 0, 11)
                        || value.toLowerCase(Locale.ROOT).startsWith("data:")) {
                    throw new BrandingInvalidException(field);
                }
                yield new Change.Set<>(value);
            }
        };
    }

    private static Change<String> color(Change<String> patch) {
        return switch (patch) {
            case Change.Unchanged<String> ignored -> patch;
            case Change.Clear<String> ignored -> patch;
            case Change.Set<String> set -> {
                if (set.value() == null || set.value().isBlank()) yield new Change.Clear<>();
                String value = set.value().strip().toLowerCase(Locale.ROOT);
                if (!COLOR.matcher(value).matches()) throw new BrandingInvalidException("primaryColor");
                yield new Change.Set<>(value);
            }
        };
    }

    private static SiteApi.Branding merge(SiteApi.Branding current, BrandingChange patch) {
        SiteApi.Branding base = current == null ? new SiteApi.Branding(null, null, null) : current;
        return new SiteApi.Branding(
                field(base.logo(), patch.logo()),
                field(base.favicon(), patch.favicon()),
                field(base.primaryColor(), patch.primaryColor()));
    }

    private static String field(String current, Change<String> patch) {
        return switch (patch) {
            case Change.Unchanged<String> ignored -> current;
            case Change.Clear<String> ignored -> null;
            case Change.Set<String> set -> set.value();
        };
    }

    private static String token(Change<?> patch) {
        return switch (patch) {
            case Change.Unchanged<?> ignored -> "unchanged";
            case Change.Clear<?> ignored -> "clear";
            case Change.Set<?> set -> "set:" + set.value();
        };
    }

    private static String brandingToken(BrandingChange patch) {
        return token(patch.logo()) + "|" + token(patch.favicon()) + "|" + token(patch.primaryColor());
    }

    public sealed interface Change<T> {
        record Unchanged<T>() implements Change<T> {}

        record Clear<T>() implements Change<T> {}

        record Set<T>(T value) implements Change<T> {}
    }

    public record BrandingChange(Change<String> logo, Change<String> favicon, Change<String> primaryColor) {
        public BrandingChange {
            logo = logo == null ? new Change.Unchanged<>() : logo;
            favicon = favicon == null ? new Change.Unchanged<>() : favicon;
            primaryColor = primaryColor == null ? new Change.Unchanged<>() : primaryColor;
        }

        boolean empty() {
            return logo instanceof Change.Unchanged<?>
                    && favicon instanceof Change.Unchanged<?>
                    && primaryColor instanceof Change.Unchanged<?>;
        }
    }

    record NormalizedPatch(
            Change<String> name,
            Change<String> titleTemplate,
            BrandingChange branding,
            Change<String> locale,
            Change<String> analyticsId,
            Change<SiteApi.RobotsPolicy> robotsPolicy,
            Change<UUID> home,
            Change<String> rule) {}
}
