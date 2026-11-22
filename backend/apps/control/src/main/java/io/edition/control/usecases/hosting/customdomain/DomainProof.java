package io.edition.control.usecases.hosting.customdomain;

import io.edition.control.modules.customdomain.api.CustomDomainApi;
import io.edition.control.modules.dnslookup.api.DnsLookupApi;
import java.util.List;

final class DomainProof {
    private DomainProof() {}

    static boolean matches(DnsLookupApi dns, boolean autoProve, CustomDomainApi.View current) {
        List<String> records;
        try {
            records = dns.lookupTxt(current.txtName());
        } catch (DnsLookupApi.Timeout ignored) {
            throw new DomainDnsTimeoutException();
        } catch (DnsLookupApi.Unavailable ignored) {
            throw new DomainDnsUnavailableException();
        }
        if (records.isEmpty() && autoProve) records = List.of(current.dnsToken());
        return records.contains(current.dnsToken());
    }
}
