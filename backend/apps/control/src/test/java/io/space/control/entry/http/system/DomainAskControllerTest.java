package io.space.control.entry.http.system;

import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import io.space.control.compositions.hosting.customdomain.AllowDomainUseCase;
import org.junit.jupiter.api.Test;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

class DomainAskControllerTest {
    @Test
    void onlyTheCaddyDomainParameterCanAuthorizeAHost() throws Exception {
        var domains = mock(AllowDomainUseCase.class);
        when(domains.allowDomain("docs.example.org")).thenReturn(true);
        var http = MockMvcBuilders.standaloneSetup(new DomainAskController(domains, ""))
                .build();
        http.perform(get("/ops/domains/allowed").param("domain", "docs.example.org"))
                .andExpect(status().isOk());
        http.perform(get("/ops/domains/allowed").param("host", "docs.example.org"))
                .andExpect(status().isNotFound());
        verify(domains, times(1)).allowDomain("docs.example.org");
    }
}
