package io.edition.control.adapters.inbound.http.site;

import io.edition.control.adapters.inbound.http.problem.ApiProblem;
import io.edition.control.adapters.inbound.http.security.BearerCredential;
import io.edition.control.adapters.inbound.http.security.IdempotencyKeyFilter;
import io.edition.control.adapters.inbound.http.security.IdempotentReplay;
import io.edition.control.usecases.hosting.customdomain.BindDomainUseCase;
import io.edition.control.usecases.hosting.customdomain.SetPrimaryDomainUseCase;
import io.edition.control.usecases.hosting.customdomain.UnbindDomainUseCase;
import io.edition.control.usecases.hosting.customdomain.VerifyDomainUseCase;
import io.edition.control.usecases.hosting.customdomain.ViewDomainUseCase;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.enums.ParameterIn;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

/** 站点嵌套的自定义域名端点：DTO ↔ BindDomainUseCase。 */
@RestController
@RequestMapping("/api/v1/tenants/{tenantId}/sites/{siteId}/domains")
class DomainController {
    private final BindDomainUseCase bindDomainUseCase;
    private final ViewDomainUseCase viewDomainUseCase;
    private final VerifyDomainUseCase verifyDomainUseCase;
    private final SetPrimaryDomainUseCase setPrimaryDomainUseCase;
    private final UnbindDomainUseCase unbindDomainUseCase;
    private final BearerCredential bearer;

    DomainController(
            BindDomainUseCase bindDomainUseCase,
            ViewDomainUseCase viewDomainUseCase,
            VerifyDomainUseCase verifyDomainUseCase,
            SetPrimaryDomainUseCase setPrimaryDomainUseCase,
            UnbindDomainUseCase unbindDomainUseCase,
            BearerCredential bearer) {
        this.bindDomainUseCase = bindDomainUseCase;
        this.viewDomainUseCase = viewDomainUseCase;
        this.verifyDomainUseCase = verifyDomainUseCase;
        this.setPrimaryDomainUseCase = setPrimaryDomainUseCase;
        this.unbindDomainUseCase = unbindDomainUseCase;
        this.bearer = bearer;
    }

    @PostMapping
    @Operation(operationId = "bindDomain", summary = "Bind a custom domain to a Site")
    @Parameter(name = "Idempotency-Key", in = ParameterIn.HEADER, required = true)
    @ApiResponses({
        @ApiResponse(
                responseCode = "201",
                content =
                        @Content(
                                mediaType = MediaType.APPLICATION_JSON_VALUE,
                                schema = @Schema(implementation = DomainContract.DetailResponse.class))),
        @ApiResponse(
                responseCode = "401",
                content =
                        @Content(
                                mediaType = MediaType.APPLICATION_PROBLEM_JSON_VALUE,
                                schema = @Schema(implementation = ApiProblem.class))),
        @ApiResponse(
                responseCode = "403",
                content =
                        @Content(
                                mediaType = MediaType.APPLICATION_PROBLEM_JSON_VALUE,
                                schema = @Schema(implementation = ApiProblem.class))),
        @ApiResponse(
                responseCode = "409",
                content =
                        @Content(
                                mediaType = MediaType.APPLICATION_PROBLEM_JSON_VALUE,
                                schema = @Schema(implementation = ApiProblem.class))),
        @ApiResponse(
                responseCode = "422",
                content =
                        @Content(
                                mediaType = MediaType.APPLICATION_PROBLEM_JSON_VALUE,
                                schema = @Schema(implementation = ApiProblem.class)))
    })
    ResponseEntity<String> bind(
            @PathVariable UUID tenantId,
            @PathVariable UUID siteId,
            @Valid @RequestBody BindRequest body,
            @Parameter(hidden = true) HttpServletRequest request) {
        return IdempotentReplay.of(bindDomainUseCase.bindDomain(
                bearer.require(), tenantId, siteId, body.host(), IdempotencyKeyFilter.require(request)));
    }

    @GetMapping("/{host}")
    @Operation(operationId = "viewDomain", summary = "Read a bound custom domain including the TXT challenge")
    DomainContract.DetailResponse view(
            @PathVariable UUID tenantId, @PathVariable UUID siteId, @PathVariable String host) {
        return DomainContract.DetailResponse.from(
                viewDomainUseCase.viewDomain(bearer.require(), tenantId, siteId, host));
    }

    @PostMapping("/{host}:verify")
    @Operation(operationId = "verifyDomain", summary = "Verify a custom domain via DNS TXT")
    @Parameter(name = "Idempotency-Key", in = ParameterIn.HEADER, required = true)
    @MutationResponses
    ResponseEntity<String> verify(
            @PathVariable UUID tenantId,
            @PathVariable UUID siteId,
            @PathVariable String host,
            @Parameter(hidden = true) HttpServletRequest request) {
        return IdempotentReplay.of(verifyDomainUseCase.verifyDomain(
                bearer.require(), tenantId, siteId, host, IdempotencyKeyFilter.require(request)));
    }

    @PostMapping("/{host}:setPrimary")
    @Operation(operationId = "setPrimaryDomain", summary = "Mark a verified custom domain as primary")
    @Parameter(name = "Idempotency-Key", in = ParameterIn.HEADER, required = true)
    @MutationResponses
    ResponseEntity<String> setPrimary(
            @PathVariable UUID tenantId,
            @PathVariable UUID siteId,
            @PathVariable String host,
            @Parameter(hidden = true) HttpServletRequest request) {
        return IdempotentReplay.of(setPrimaryDomainUseCase.setPrimaryDomain(
                bearer.require(), tenantId, siteId, host, IdempotencyKeyFilter.require(request)));
    }

    @DeleteMapping("/{host}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(operationId = "unbindDomain", summary = "Unbind a custom domain")
    @Parameter(name = "Idempotency-Key", in = ParameterIn.HEADER, required = true)
    void unbind(
            @PathVariable UUID tenantId,
            @PathVariable UUID siteId,
            @PathVariable String host,
            @Parameter(hidden = true) HttpServletRequest request) {
        unbindDomainUseCase.unbindDomain(
                bearer.require(), tenantId, siteId, host, IdempotencyKeyFilter.require(request));
    }

    record BindRequest(@NotBlank String host) {}

    @java.lang.annotation.Target(java.lang.annotation.ElementType.METHOD)
    @java.lang.annotation.Retention(java.lang.annotation.RetentionPolicy.RUNTIME)
    @ApiResponses({
        @ApiResponse(
                responseCode = "200",
                content =
                        @Content(
                                mediaType = MediaType.APPLICATION_JSON_VALUE,
                                schema = @Schema(implementation = DomainContract.DetailResponse.class))),
        @ApiResponse(
                responseCode = "401",
                content =
                        @Content(
                                mediaType = MediaType.APPLICATION_PROBLEM_JSON_VALUE,
                                schema = @Schema(implementation = ApiProblem.class))),
        @ApiResponse(
                responseCode = "403",
                content =
                        @Content(
                                mediaType = MediaType.APPLICATION_PROBLEM_JSON_VALUE,
                                schema = @Schema(implementation = ApiProblem.class))),
        @ApiResponse(
                responseCode = "404",
                content =
                        @Content(
                                mediaType = MediaType.APPLICATION_PROBLEM_JSON_VALUE,
                                schema = @Schema(implementation = ApiProblem.class))),
        @ApiResponse(
                responseCode = "409",
                content =
                        @Content(
                                mediaType = MediaType.APPLICATION_PROBLEM_JSON_VALUE,
                                schema = @Schema(implementation = ApiProblem.class))),
        @ApiResponse(
                responseCode = "422",
                content =
                        @Content(
                                mediaType = MediaType.APPLICATION_PROBLEM_JSON_VALUE,
                                schema = @Schema(implementation = ApiProblem.class)))
    })
    @interface MutationResponses {}
}
