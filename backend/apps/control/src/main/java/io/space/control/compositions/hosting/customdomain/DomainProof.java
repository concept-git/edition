package io.space.control.compositions.hosting.customdomain;

import io.space.concepts.customdomain.api.CustomDomainApi;
import io.space.concepts.dnslookup.api.DnsLookupApi;
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
