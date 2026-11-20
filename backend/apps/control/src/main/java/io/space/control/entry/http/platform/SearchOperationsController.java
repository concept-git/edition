package io.space.control.entry.http.platform;

import io.space.control.compositions.platform.search.ConfigureSearchUseCase;
import io.space.control.compositions.platform.search.ReindexSearchUseCase;
import io.space.control.compositions.platform.search.SearchConfigurationUseCase;
import io.space.control.compositions.platform.search.SearchTypes;
import io.space.control.entry.http.security.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.enums.ParameterIn;
import io.swagger.v3.oas.annotations.media.*;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import java.util.*;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
class SearchOperationsController {
    private final SearchConfigurationUseCase searchConfigurationUseCase;
    private final ConfigureSearchUseCase configureSearchUseCase;
    private final ReindexSearchUseCase reindexSearchUseCase;
    private final BearerCredential bearer;

    SearchOperationsController(
            SearchConfigurationUseCase searchConfigurationUseCase,
            ConfigureSearchUseCase configureSearchUseCase,
            ReindexSearchUseCase reindexSearchUseCase,
            BearerCredential bearer) {
        this.searchConfigurationUseCase = searchConfigurationUseCase;
        this.configureSearchUseCase = configureSearchUseCase;
        this.reindexSearchUseCase = reindexSearchUseCase;
        this.bearer = bearer;
    }

    @GetMapping("/api/v1/tenants/{tenantId}/sites/{siteId}/search")
    @Operation(operationId = "searchConfiguration", summary = "Read desired search field order")
    SearchTypes.Configuration configuration(@PathVariable UUID tenantId, @PathVariable UUID siteId) {
        return searchConfigurationUseCase.searchConfiguration(bearer.require(), tenantId, siteId);
    }

    @PutMapping("/api/v1/tenants/{tenantId}/sites/{siteId}/search")
    @Operation(operationId = "configureSearch", summary = "Queue a search field order change")
    @Parameter(name = "Idempotency-Key", in = ParameterIn.HEADER, required = true)
    @ApiResponse(
            responseCode = "202",
            content = @Content(schema = @Schema(implementation = SearchTypes.Configuration.class)))
    ResponseEntity<String> configure(
            @PathVariable UUID tenantId,
            @PathVariable UUID siteId,
            @Valid @RequestBody Fields body,
            HttpServletRequest request) {
        return IdempotentReplay.of(configureSearchUseCase.configureSearch(
                bearer.require(), tenantId, siteId, body.fields(), IdempotencyKeyFilter.require(request)));
    }

    @PostMapping("/ops/search:reindex")
    @Operation(operationId = "reindexSearch", summary = "Queue a complete search rebuild as platform operator")
    @Parameter(name = "Idempotency-Key", in = ParameterIn.HEADER, required = true)
    @ApiResponse(
            responseCode = "202",
            content = @Content(schema = @Schema(implementation = SearchTypes.Configuration.class)))
    ResponseEntity<String> reindex(@Valid @RequestBody Target body, HttpServletRequest request) {
        return IdempotentReplay.of(reindexSearchUseCase.reindexSearch(
                bearer.require(), body.tenantId(), body.siteId(), IdempotencyKeyFilter.require(request)));
    }

    record Fields(
            @NotNull
            @Size(min = 3, max = 3)
            @ArraySchema(uniqueItems = true, schema = @Schema(allowableValues = {"title", "headings", "body"}))
            List<@NotBlank String> fields) {}

    record Target(@NotNull UUID tenantId, @NotNull UUID siteId) {}
}
