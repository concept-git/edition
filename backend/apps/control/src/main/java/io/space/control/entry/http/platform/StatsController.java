package io.space.control.entry.http.platform;

import io.space.control.compositions.platform.statistics.IngestUseCase;
import io.space.control.compositions.platform.statistics.SearchUseCase;
import io.space.control.compositions.platform.statistics.SpaceUsageUseCase;
import io.space.control.compositions.platform.statistics.StatisticsTypes;
import io.space.control.compositions.platform.statistics.TenantUsageUseCase;
import io.space.control.compositions.platform.statistics.TrafficUseCase;
import io.space.control.entry.http.security.BearerCredential;
import io.space.delivery.contract.TelemetryEvent;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Size;
import java.time.Instant;
import java.util.*;
import org.springframework.web.bind.annotation.*;

@RestController
class StatsController {
    private final IngestUseCase ingestUseCase;
    private final TenantUsageUseCase tenantUsageUseCase;
    private final SpaceUsageUseCase spaceUsageUseCase;
    private final TrafficUseCase trafficUseCase;
    private final SearchUseCase searchUseCase;
    private final BearerCredential bearer;

    StatsController(
            IngestUseCase ingestUseCase,
            TenantUsageUseCase tenantUsageUseCase,
            SpaceUsageUseCase spaceUsageUseCase,
            TrafficUseCase trafficUseCase,
            SearchUseCase searchUseCase,
            BearerCredential bearer) {
        this.ingestUseCase = ingestUseCase;
        this.tenantUsageUseCase = tenantUsageUseCase;
        this.spaceUsageUseCase = spaceUsageUseCase;
        this.trafficUseCase = trafficUseCase;
        this.searchUseCase = searchUseCase;
        this.bearer = bearer;
    }

    @PostMapping("/internal/analytics")
    @Operation(operationId = "ingestAnalytics", summary = "Internal scoped collector ingestion")
    StatisticsTypes.Accepted ingest(
            @Parameter(hidden = true) @RequestHeader("X-Analytics-Key") String key,
            @Valid @RequestBody @Size(max = 500) List<TelemetryEvent> events) {
        return ingestUseCase.ingest(key, events);
    }

    @GetMapping("/stats/tenants/{id}")
    @Operation(operationId = "tenantUsage", summary = "Tenant logical usage and activity")
    StatisticsTypes.Usage tenant(
            @PathVariable UUID id,
            @RequestParam(required = false) Instant from,
            @RequestParam(required = false) Instant to) {
        return tenantUsageUseCase.tenantUsage(bearer.require(), id, from, to);
    }

    @GetMapping("/stats/spaces/{id}")
    @Operation(operationId = "spaceUsage", summary = "Space logical usage and activity")
    StatisticsTypes.Usage space(
            @PathVariable UUID id,
            @RequestParam UUID tenantId,
            @RequestParam(required = false) Instant from,
            @RequestParam(required = false) Instant to) {
        return spaceUsageUseCase.spaceUsage(bearer.require(), tenantId, id, from, to);
    }

    @GetMapping("/stats/sites/{id}/traffic")
    @Operation(operationId = "siteTraffic", summary = "Page views, daily estimated visitors and missing paths")
    StatisticsTypes.Traffic traffic(
            @PathVariable UUID id,
            @RequestParam UUID tenantId,
            @RequestParam(required = false) Instant from,
            @RequestParam(required = false) Instant to,
            @RequestParam(defaultValue = "day") String granularity) {
        return trafficUseCase.traffic(bearer.require(), tenantId, id, from, to, granularity);
    }

    @GetMapping("/stats/sites/{id}/search")
    @Operation(operationId = "siteSearchStats", summary = "Submitted searches, zero results and observable click rate")
    StatisticsTypes.Search search(
            @PathVariable UUID id,
            @RequestParam UUID tenantId,
            @RequestParam(required = false) Instant from,
            @RequestParam(required = false) Instant to) {
        return searchUseCase.search(bearer.require(), tenantId, id, from, to);
    }
}
