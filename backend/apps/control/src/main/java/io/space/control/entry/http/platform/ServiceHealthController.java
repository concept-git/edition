package io.space.control.entry.http.platform;

import io.space.control.compositions.platform.servicehealth.PlatformHealthUseCase;
import io.space.control.compositions.platform.servicehealth.ServiceStatuses;
import io.space.control.entry.http.security.BearerCredential;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * 平台 · 服务状态：三个运行进程的心跳判定。只对平台运营员开放（403 platform_operator_required）。
 * 只做 flow 结果的直出，不含判定规则。
 */
@RestController
@SecurityRequirement(name = "bearerAuth")
@ApiResponse(
        responseCode = "401",
        description = "Missing, expired or revoked session (authentication_required)",
        content =
                @Content(
                        mediaType = AdminTenantController.PROBLEM,
                        schema = @Schema(ref = "#/components/schemas/ApiProblem")))
@ApiResponse(
        responseCode = "403",
        description = "Caller is not a platform operator (platform_operator_required)",
        content =
                @Content(
                        mediaType = AdminTenantController.PROBLEM,
                        schema = @Schema(ref = "#/components/schemas/ApiProblem")))
class ServiceHealthController {
    private final PlatformHealthUseCase platformHealthUseCase;
    private final BearerCredential bearer;

    ServiceHealthController(PlatformHealthUseCase platformHealthUseCase, BearerCredential bearer) {
        this.platformHealthUseCase = platformHealthUseCase;
        this.bearer = bearer;
    }

    @GetMapping("/admin/health")
    @Operation(
            operationId = "platformHealth",
            summary = "Report liveness and lag of the management, reader and worker processes",
            description = "Heartbeats older than 60s are lagging, older than 180s are lost; the reader is probed over"
                    + " HTTP and reports unconfigured when no READER_HEALTH_URL is set.")
    @ApiResponse(responseCode = "200", description = "Per-service status with instances and details")
    ServiceStatuses.HealthReport platformHealth() {
        return platformHealthUseCase.platformHealth(bearer.require());
    }
}
