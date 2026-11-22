package io.edition.control.adapters.inbound.http.system;

import io.edition.control.adapters.inbound.http.problem.GatewayProblemException;
import io.edition.control.usecases.flow.ProblemCode;
import io.edition.control.usecases.hosting.customdomain.AllowDomainUseCase;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/** Caddy on-demand TLS ask：已核验 200 空体，否则 404。无用户会话。 */
@RestController
class DomainAskController {
    private final AllowDomainUseCase allowDomainUseCase;
    private final String askToken;

    DomainAskController(
            AllowDomainUseCase allowDomainUseCase, @Value("${io.edition.domain-ask.token:}") String askToken) {
        this.allowDomainUseCase = allowDomainUseCase;
        this.askToken = askToken == null ? "" : askToken;
    }

    @GetMapping("/ops/domains/allowed")
    @Operation(operationId = "allowDomain", summary = "Caddy on-demand TLS ask")
    ResponseEntity<Void> allow(
            @RequestParam(required = false) String domain,
            @Parameter(hidden = true) @RequestHeader(value = "X-Domain-Ask-Token", required = false) String supplied) {
        requireAskToken(supplied);
        if (domain == null || domain.isBlank() || !allowDomainUseCase.allowDomain(domain.strip())) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok().build();
    }

    private void requireAskToken(String supplied) {
        if (askToken.isBlank()) return;
        byte[] expected = askToken.getBytes(StandardCharsets.UTF_8);
        byte[] actual = (supplied == null ? "" : supplied).getBytes(StandardCharsets.UTF_8);
        if (!MessageDigest.isEqual(expected, actual)) throw new AskTokenRejectedException();
    }

    static final class AskTokenRejectedException extends GatewayProblemException {
        AskTokenRejectedException() {
            super(ProblemCode.PERMISSION_DENIED);
        }
    }
}
