package io.edition.concepts.dnslookup.adapters.fake;

import io.edition.concepts.dnslookup.api.*;
import io.edition.concepts.dnslookup.api.DnsLookupApi;
import java.util.List;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
@ConditionalOnProperty(name = "io.edition.dns.resolver", havingValue = "fake")
class FakeDnsLookup implements DnsLookupApi {
    private final JdbcTemplate jdbc;

    FakeDnsLookup(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    @Override
    public List<String> lookupTxt(String name) {
        return jdbc.query(
                "select value from shared.dns_txt_stubs where name = ? order by value",
                (rs, rowNum) -> rs.getString(1),
                name);
    }
}
