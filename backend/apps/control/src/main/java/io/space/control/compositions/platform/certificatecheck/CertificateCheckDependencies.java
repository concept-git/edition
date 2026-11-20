package io.space.control.compositions.platform.certificatecheck;

import static io.space.control.compositions.platform.certificatecheck.CertificateCheckTypes.*;

import io.space.concepts.certificateinspection.api.CertificateInspectionApi;
import io.space.concepts.customdomain.api.CustomDomainApi;
import io.space.control.compositions.access.PlatformOperatorGuard;
import io.space.control.compositions.access.TenantAccess;
import io.space.control.compositions.resource.ResourceChain;
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
