package io.space.control.entry.http.platform;

import io.space.control.compositions.platform.certificatecheck.CertificateCheckTypes;
import io.space.control.compositions.platform.certificatecheck.DomainCertificateUseCase;
import io.space.control.entry.http.security.BearerCredential;
import io.swagger.v3.oas.annotations.Operation;
import java.util.UUID;
import org.springframework.web.bind.annotation.*;

@RestController
class CertificateController {
    private final DomainCertificateUseCase domainCertificateUseCase;
    private final BearerCredential bearer;

    CertificateController(DomainCertificateUseCase domainCertificateUseCase, BearerCredential bearer) {
        this.domainCertificateUseCase = domainCertificateUseCase;
        this.bearer = bearer;
    }

    @GetMapping("/ops/domains/{host}/certificate")
    @Operation(operationId = "domainCertificate", summary = "Inspect the actual TLS certificate of a bound domain")
    CertificateCheckTypes.Certificate certificate(
            @PathVariable String host,
            @RequestParam UUID tenantId,
            @RequestParam UUID siteId,
            @RequestParam(defaultValue = "false") boolean platform) {
        return domainCertificateUseCase.domainCertificate(bearer.require(), tenantId, siteId, host, platform);
    }
}
