package io.edition.control.entry.http.system;

import io.swagger.v3.oas.annotations.Operation;
import org.springframework.boot.availability.ApplicationAvailability;
import org.springframework.boot.availability.ReadinessState;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

/** 对编排器公开的存活与就绪探针，不承载业务状态。 */
@RestController
class AvailabilityController {

    private final ApplicationAvailability availability;

    AvailabilityController(ApplicationAvailability availability) {
        this.availability = availability;
    }

    @GetMapping("/healthz")
    @Operation(summary = "Liveness probe")
    ProbeResponse health() {
        return new ProbeResponse("UP");
    }

    @GetMapping("/readyz")
    @Operation(summary = "Readiness probe")
    ResponseEntity<ProbeResponse> readiness() {
        var ready = availability.getReadinessState() == ReadinessState.ACCEPTING_TRAFFIC;
        return ResponseEntity.status(ready ? 200 : 503).body(new ProbeResponse(ready ? "UP" : "OUT_OF_SERVICE"));
    }

    record ProbeResponse(String status) {}
}
