package io.edition.control.usecases.platform.statistics;

import io.edition.control.modules.analytics.api.AnalyticsApi;
import io.edition.control.modules.importjob.api.ImportJobApi;
import io.edition.control.modules.page.api.PageApi;
import io.edition.control.modules.release.api.ReleaseApi;
import io.edition.control.modules.space.api.SpaceApi;
import java.time.*;
import java.util.*;
import java.util.stream.Collectors;
import org.springframework.stereotype.Component;

/** 组合逻辑用量：工作集/回收站/发版快照与导入结果，不读交付副本。 */
@Component
public class UsageProjection {
    private final SpaceApi spaces;
    private final PageApi pages;
    private final ReleaseApi releases;
    private final ImportJobApi jobs;
    private final AnalyticsApi analytics;
    private final Clock clock;

    public UsageProjection(
            SpaceApi spaces,
            PageApi pages,
            ReleaseApi releases,
            ImportJobApi jobs,
            AnalyticsApi analytics,
            Clock clock) {
        this.spaces = spaces;
        this.pages = pages;
        this.releases = releases;
        this.jobs = jobs;
        this.analytics = analytics;
        this.clock = clock;
    }

    public StatisticsTypes.Usage usage(UUID tenant, UUID only, Instant from, Instant to) {
        var selected = only == null
                ? spaces.listByTenant(tenant)
                : spaces.view(new SpaceApi.SpaceId(only)).stream().toList();
        long working = 0,
                trash = 0,
                published = 0,
                text = 0,
                trashBytes = 0,
                attachments = 0,
                attachmentBytes = 0,
                releaseCount = 0,
                snapshotPages = 0,
                snapshotBytes = 0;
        for (var space : selected) {
            var ids = spaces.itemsOf(new SpaceApi.SpaceId(space.id())).stream()
                    .map(SpaceApi.Placement::item)
                    .collect(Collectors.toSet());
            var p = pages.usage(ids);
            var r = releases.usage(new ReleaseApi.ScopeId(space.id()));
            working += p.workingPages();
            trash += p.trashedPages();
            published += p.publishedPages();
            text += p.workingTextBytes();
            trashBytes += p.trashedTextBytes();
            attachments += p.attachmentCount();
            attachmentBytes += p.attachmentBytes();
            releaseCount += r.releases();
            snapshotPages += r.snapshotPages();
            snapshotBytes += r.textBytes();
        }
        var activity = analytics.usageActivity(only, from, to);
        return new StatisticsTypes.Usage(
                working,
                trash,
                published,
                text,
                trashBytes,
                attachments,
                attachmentBytes,
                releaseCount,
                snapshotPages,
                snapshotBytes,
                activity.promotions(),
                activity.activeAuthors(),
                jobs.outcomes(only, from, to),
                clock.instant());
    }
}
