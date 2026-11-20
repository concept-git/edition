package io.space.concepts.dnslookup;

import static org.assertj.core.api.Assertions.*;

import io.space.concepts.dnslookup.api.*;
import java.util.*;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.jdbc.core.JdbcTemplate;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.*;

@Testcontainers
@org.springframework.test.annotation.DirtiesContext(
        classMode = org.springframework.test.annotation.DirtiesContext.ClassMode.AFTER_CLASS)
@SpringBootTest(
        classes = io.space.ConceptTestApplication.class,
        properties = {})
@org.springframework.context.annotation.Import(io.space.concepts.dnslookup.adapters.DnsLookupConfiguration.class)
class DnsLookupContractTest {
    @Container
    @ServiceConnection
    static final PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:18.6");

    @Autowired
    DnsLookupApi api;

    @Autowired
    io.space.testing.DatabaseScope scope;

    @Autowired
    @Qualifier("fixtureJdbcTemplate")
    JdbcTemplate fixtures;

    @Test
    void absentNamesHaveNoBindingsAndTxtRecordsAreReturnedWithoutInventingValues() {
        String name = "_space." + UUID.randomUUID() + ".example.invalid";
        assertThat(api.lookupTxt(name)).isEmpty();
        fixtures.update("insert into shared.dns_txt_stubs(name,value) values(?,?),(?,?)", name, "z", name, "a");
        assertThat(api.lookupTxt(name)).containsExactly("a", "z");
    }
}
