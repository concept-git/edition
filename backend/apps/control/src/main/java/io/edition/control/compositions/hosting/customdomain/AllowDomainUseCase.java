package io.edition.control.compositions.hosting.customdomain;

import static io.edition.control.compositions.hosting.customdomain.CustomDomainTypes.*;

import io.edition.concepts.customdomain.api.CustomDomainApi;
import io.edition.concepts.customdomain.api.Host;
import org.springframework.transaction.annotation.Transactional;

@org.springframework.stereotype.Service
public class AllowDomainUseCase {

    private final CustomDomainApi domains;

    AllowDomainUseCase(CustomDomainDependencies dependencies) {
        this.domains = dependencies.domains;
    }

    @Transactional(readOnly = true)
    public boolean allowDomain(String host) {
        try (var requestScope = io.edition.control.compositions.RequestAuditContext.entry()) {
            try {
                String normalized = new Host(host).value();
                return domains.resolve(normalized).isPresent();
            } catch (Host.Invalid ignored) {
                return false;
            }
        }
    }
}
