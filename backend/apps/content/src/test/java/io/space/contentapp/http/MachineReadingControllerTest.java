package io.space.contentapp.entry.http;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import io.space.delivery.contract.SiteSnapshot;
import io.space.contentapp.compositions.access.ContentIdentity;
import io.space.contentapp.compositions.machine.MachineReading;
import io.space.contentapp.compositions.navigation.ContentNavigation;
import io.space.contentapp.compositions.search.ContentSearch;
import io.space.contentapp.entry.observability.ContentAnalytics;
import io.space.contentapp.entry.persistence.PublicationPages;
import jakarta.servlet.http.Cookie;
import java.util.List;
import java.util.UUID;
import org.junit.jupiter.api.Test;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

class MachineReadingControllerTest {
    @Test
    void conventionalPathsReturnMarkdownOnTheCurrentHost() throws Exception {
        var publication = mock(PublicationPages.class);
        var machine = mock(MachineReading.class);
        var identity = new ContentIdentity();
        var origins = new ContentRequestOrigin(List.of());
        var proof = ContentIdentity.PublicationCredential.ANONYMOUS;
        var brand = new SiteSnapshot.Brand("Site", null, null, null, "en", null, null, "index");
        var space = new SiteSnapshot.Space(UUID.randomUUID(), "guide", "Guide", UUID.randomUUID(), List.of());
        var index = new PublicationPages.MachineDocument(List.of(space), List.of());
        var ready = new PublicationPages.NavigationRead<>("ok", "docs.example.com", brand, index);
        var page = mock(SiteSnapshot.Page.class);
        when(publication.machine("docs.example.com", null, proof)).thenReturn(ready);
        when(publication.machine("docs.example.com", "guide", proof)).thenReturn(ready);
        when(publication.read("docs.example.com", "/guide/install", null, null, null))
                .thenReturn(new PublicationPages.PageRead("ok", "docs.example.com", page));
        when(machine.siteIndex(brand, index.spaces(), index.pages(), "http://docs.example.com"))
                .thenReturn("# Site\n");
        when(machine.spaceIndex(brand, space, index.pages(), "http://docs.example.com"))
                .thenReturn("# Guide\n");
        when(machine.markdown(page, "/guide/install")).thenReturn("# Install\n");
        var browser = new ContentController(
                mock(ContentNavigation.class),
                mock(ContentSearch.class),
                origins,
                mock(ContentAnalytics.class),
                identity,
                publication);
        var mvc = MockMvcBuilders.standaloneSetup(
                        new MachineReadingController(machine, identity, origins, publication), browser)
                .build();

        for (var path : List.of("/llms.txt", "/guide/llms.txt", "/guide/install?view=markdown")) {
            var response = mvc.perform(MockMvcRequestBuilders.get(path).header("Host", "docs.example.com"))
                    .andReturn()
                    .getResponse();
            assertThat(response.getStatus()).isEqualTo(200);
            assertThat(response.getContentType()).isEqualTo("text/markdown;charset=UTF-8");
            assertThat(response.getHeader("Cache-Control")).contains("no-store");
            assertThat(response.getContentAsString()).startsWith("# ");
        }
    }

    @Test
    void machinePagePassesScopedProofsToTheReadContract() throws Exception {
        var machine = mock(MachineReading.class);
        var identity = new ContentIdentity();
        var publication = mock(PublicationPages.class);
        var token = UUID.randomUUID();
        String secret = "A".repeat(43);
        String proof = java.util.HexFormat.of()
                .formatHex(java.security.MessageDigest.getInstance("SHA-256")
                        .digest(secret.getBytes(java.nio.charset.StandardCharsets.US_ASCII)));
        var page = mock(SiteSnapshot.Page.class);
        when(publication.read("docs.example.com", "/guide/install", token, proof, null))
                .thenReturn(new PublicationPages.PageRead("ok", "docs.example.com", page));
        when(machine.markdown(page, "/guide/install")).thenReturn("# Shared\n");
        var mvc = MockMvcBuilders.standaloneSetup(new MachineReadingController(
                        machine, identity, new ContentRequestOrigin(List.of()), publication))
                .build();
        var response = mvc.perform(MockMvcRequestBuilders.get("/guide/install?view=markdown")
                        .header("Host", "docs.example.com")
                        .header("Authorization", "Bearer spc_" + token + "_" + secret))
                .andReturn()
                .getResponse();
        assertThat(response.getStatus()).isEqualTo(200);
        assertThat(response.getContentAsString()).isEqualTo("# Shared\n");
        String cookie = "rs1_" + "B".repeat(43);
        String cookieProof = java.util.HexFormat.of()
                .formatHex(java.security.MessageDigest.getInstance("SHA-256")
                        .digest(cookie.getBytes(java.nio.charset.StandardCharsets.US_ASCII)));
        when(publication.read("docs.example.com", "/guide/install", null, null, cookieProof))
                .thenReturn(new PublicationPages.PageRead("ok", "docs.example.com", page));
        var authenticated = mvc.perform(MockMvcRequestBuilders.get("/guide/install?view=markdown")
                        .header("Host", "docs.example.com")
                        .cookie(new Cookie("__Host-space_reader", cookie)))
                .andReturn()
                .getResponse();
        assertThat(authenticated.getStatus()).isEqualTo(200);
        assertThat(authenticated.getContentAsString()).isEqualTo("# Shared\n");
    }
}
