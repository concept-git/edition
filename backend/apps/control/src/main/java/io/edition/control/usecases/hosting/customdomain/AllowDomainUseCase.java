package io.edition.control.usecases.hosting.customdomain;

import static io.edition.control.usecases.hosting.customdomain.CustomDomainTypes.*;

import io.edition.control.modules.customdomain.api.CustomDomainApi;
import io.edition.control.modules.customdomain.api.Host;
import org.springframework.transaction.annotation.Transactional;

@org.springframework.stereotype.Service
public class AllowDomainUseCase {

    private final CustomDomainApi domains;

    AllowDomainUseCase(CustomDomainDependencies dependencies) {
        this.domains = dependencies.domains;
    }

    @Transactional(readOnly = true)
    public boolean allowDomain(String host) {
        try (var requestScope = io.edition.control.usecases.RequestAuditContext.entry()) {
            try {
                String normalized = new Host(host).value();
                return domains.resolve(normalized).isPresent();
            } catch (Host.Invalid ignored) {
                return false;
            }
        }
    }
}
