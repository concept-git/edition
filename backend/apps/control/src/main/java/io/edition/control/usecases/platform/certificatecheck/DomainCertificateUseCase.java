package io.edition.control.usecases.platform.certificatecheck;

import static io.edition.control.usecases.platform.certificatecheck.CertificateCheckTypes.*;

import io.edition.control.modules.certificateinspection.api.CertificateInspectionApi;
import io.edition.control.modules.customdomain.api.CustomDomainApi;
import io.edition.control.usecases.access.PlatformOperatorGuard;
import io.edition.control.usecases.access.TenantAccess;
import io.edition.control.usecases.flow.OperationNotFoundException;
import io.edition.control.usecases.resource.ResourceChain;
import java.util.*;
import org.springframework.transaction.annotation.Transactional;

@org.springframework.stereotype.Service
public class DomainCertificateUseCase {
    private final CertificateInspectionApi certificates;
    private final CustomDomainApi domains;
    private final TenantAccess tenants;
    private final PlatformOperatorGuard operators;
    private final ResourceChain resources;

    DomainCertificateUseCase(CertificateCheckDependencies dependencies) {
        this.certificates = dependencies.certificates;
        this.domains = dependencies.domains;
        this.tenants = dependencies.tenants;
        this.operators = dependencies.operators;
        this.resources = dependencies.resources;
    }

    @Transactional(readOnly = true)
    public Certificate domainCertificate(String credential, UUID tenant, UUID site, String host, boolean platform) {
        if (platform) operators.require(credential);
        else
            tenants.requireUser(
                    credential,
                    tenant,
                    List.of(TenantAccess.tenant(tenant), TenantAccess.site(site)),
                    TenantAccess.ADMIN);
        resources.site(tenant, site).orElseThrow(OperationNotFoundException::new);
        String bound = tenants.inTenant(
                tenant,
                () -> domains.hostsOf(site).stream()
                        .map(CustomDomainApi.View::host)
                        .filter(host::equalsIgnoreCase)
                        .findFirst()
                        .orElseThrow(OperationNotFoundException::new));
        var result = certificates.inspect(bound);
        return new Certificate(
                bound,
                result.status(),
                result.issuer(),
                result.notBefore(),
                result.notAfter(),
                result.checkedAt(),
                result.error());
    }
}
