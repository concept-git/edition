package io.space.control.compositions.hosting.customdomain;

import static io.space.control.compositions.hosting.customdomain.CustomDomainTypes.*;

import io.space.concepts.customdomain.api.CustomDomainApi;
import io.space.concepts.customdomain.api.Host;
import org.springframework.transaction.annotation.Transactional;

@org.springframework.stereotype.Service
public class AllowDomainUseCase {

    private final CustomDomainApi domains;

    AllowDomainUseCase(CustomDomainDependencies dependencies) {
        this.domains = dependencies.domains;
    }

    @Transactional(readOnly = true)
    public boolean allowDomain(String host) {
        try (var requestScope = io.space.control.compositions.RequestAuditContext.entry()) {
            try {
                String normalized = new Host(host).value();
                return domains.resolve(normalized).isPresent();
            } catch (Host.Invalid ignored) {
                return false;
            }
        }
    }
}
