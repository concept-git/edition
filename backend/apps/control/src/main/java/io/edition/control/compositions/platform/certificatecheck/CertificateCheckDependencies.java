package io.edition.control.compositions.platform.certificatecheck;

import static io.edition.control.compositions.platform.certificatecheck.CertificateCheckTypes.*;

import io.edition.concepts.certificateinspection.api.CertificateInspectionApi;
import io.edition.concepts.customdomain.api.CustomDomainApi;
import io.edition.control.compositions.access.PlatformOperatorGuard;
import io.edition.control.compositions.access.TenantAccess;
import io.edition.control.compositions.resource.ResourceChain;
import java.util.*;

@org.springframework.stereotype.Component
final class CertificateCheckDependencies {
    final CertificateInspectionApi certificates;
    final CustomDomainApi domains;
    final TenantAccess tenants;
    final PlatformOperatorGuard operators;
    final ResourceChain resources;

    public CertificateCheckDependencies(
            CertificateInspectionApi certificates,
            CustomDomainApi domains,
            TenantAccess tenants,
            PlatformOperatorGuard operators,
            ResourceChain resources) {
        this.certificates = certificates;
        this.domains = domains;
        this.tenants = tenants;
        this.operators = operators;
        this.resources = resources;
    }
}
