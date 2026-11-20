package io.space.contentapp.entry.http;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import io.space.delivery.contract.SiteSnapshot;
import io.space.contentapp.compositions.access.ContentIdentity;
import io.space.contentapp.compositions.access.ContentIdentity.PublicationCredential;
import io.space.contentapp.compositions.site.ContentSite;
import io.space.contentapp.entry.persistence.PublicationPages;
import io.space.contentapp.entry.persistence.PublicationPages.DocumentRead;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import tools.jackson.databind.json.JsonMapper;

class SiteControllerTest {
    private static final String HOST = "docs.example.com";
    private static final PublicationCredential ANONYMOUS = PublicationCredential.ANONYMOUS;

    private final UUID siteId = UUID.randomUUID();
    private final UUID spaceId = UUID.randomUUID();
    private final SiteSnapshot.Brand brand =
            new SiteSnapshot.Brand("Docs", null, null, "#2563eb", "en", null, "G-1", "index");
    private final SiteSnapshot.Space space = new SiteSnapshot.Space(
            spaceId,
            "guide",
            "Guide",
            UUID.randomUUID(),
            List.of(new SiteSnapshot.Node("Install", "target", "/guide/install", UUID.randomUUID(), List.of())));
    private final PublicationPages.SiteDocument context =
            new PublicationPages.SiteDocument(brand, spaceId, 7, List.of(space));
    private PublicationPages publication;
    private JsonMapper json;
    private MockMvc mvc;

    @BeforeEach
    void setUp() {
        publication = mock(PublicationPages.class);
        json = JsonMapper.builder().build();
        var controller = new SiteController(
                new ContentSite(publication), new ContentIdentity(), new ContentRequestOrigin(List.of()), json);
        mvc = MockMvcBuilders.standaloneSetup(controller)
                .setControllerAdvice(new ContentErrors())
                .build();
    }

    private SiteSnapshot.Page page() {
        return new SiteSnapshot.Page(
                UUID.randomUUID(),
                spaceId,
                space.releaseId(),
                "/guide/install",
                "Install",
                "markdown",
                "hash-1",
                "# Install\n",
                Map.of("description", "d"),
                Map.of(),
                List.of(),
                Instant.parse("2026-11-01T00:00:00Z"));
    }

    private DocumentRead read(String outcome, String redirectPath, SiteSnapshot.Page page) {
        return new DocumentRead(outcome, HOST, redirectPath, siteId, page, null, context);
    }

    private MockHttpServletResponse get(String path, String... headers) throws Exception {
        var request = MockMvcRequestBuilders.get(java.net.URI.create(path)).header("Host", HOST);
        for (int i = 0; i < headers.length; i += 2) request.header(headers[i], headers[i + 1]);
        return mvc.perform(request).andReturn().getResponse();
    }

    @Test
    void siteDescribesBrandSpacesAndNavigationWithRevalidatableCaching() throws Exception {
        when(publication.document(HOST, "/", ANONYMOUS)).thenReturn(read("ok", null, page()));

        var response = get("/api/content/site");

        assertThat(response.getStatus()).isEqualTo(200);
        assertThat(response.getContentType()).startsWith("application/json");
        assertThat(response.getHeader("Cache-Control")).contains("public").contains("no-cache");
        assertThat(response.getHeader("Vary")).isEqualTo("Cookie, Authorization");
        var body = json.readTree(response.getContentAsString());
        assertThat(body.get("name").asString()).isEqualTo("Docs");
        assertThat(body.get("home").asString()).isEqualTo("/guide");
        assertThat(body.get("spaces")
                        .get(0)
                        .get("navigation")
                        .get(0)
                        .get("href")
                        .asString())
                .isEqualTo("/guide/install");

        var etag = response.getHeader("ETag");
        assertThat(etag).startsWith("\"").endsWith("\"");
        var cached = get("/api/content/site", "If-None-Match", etag);
        assertThat(cached.getStatus()).isEqualTo(304);
        assertThat(cached.getContentAsByteArray()).isEmpty();
        assertThat(cached.getHeader("ETag")).isEqualTo(etag);
        assertThat(get("/api/content/site", "If-None-Match", "\"other\", W/" + etag)
                        .getStatus())
                .isEqualTo(304);
        assertThat(get("/api/content/site", "If-None-Match", "*").getStatus()).isEqualTo(304);
        assertThat(get("/api/content/site", "If-None-Match", "\"other\"").getStatus())
                .isEqualTo(200);
    }

    @Test
    void siteDescribesForbiddenReadersWithoutSpacesAndCredentialedResponsesStayPrivate() throws Exception {
        var token = UUID.randomUUID();
        String secret = "A".repeat(43);
        String proof = java.util.HexFormat.of()
                .formatHex(java.security.MessageDigest.getInstance("SHA-256")
                        .digest(secret.getBytes(java.nio.charset.StandardCharsets.US_ASCII)));
        var anonymousContext = new PublicationPages.SiteDocument(brand, spaceId, 7, List.of());
        when(publication.document(HOST, "/", ANONYMOUS))
                .thenReturn(new DocumentRead("forbidden", HOST, null, siteId, null, null, anonymousContext));
        when(publication.document(HOST, "/", new PublicationCredential(token, proof, null)))
                .thenReturn(read("ok", null, page()));

        var forbidden = get("/api/content/site");
        assertThat(forbidden.getStatus()).isEqualTo(200);
        assertThat(json.readTree(forbidden.getContentAsString()).get("spaces")).isEmpty();
        assertThat(json.readTree(forbidden.getContentAsString()).get("home").isNull())
                .isTrue();

        var credentialed = get("/api/content/site", "Authorization", "Bearer spc_" + token + "_" + secret);
        assertThat(credentialed.getStatus()).isEqualTo(200);
        assertThat(credentialed.getHeader("Cache-Control")).contains("private").doesNotContain("public");
    }

    @Test
    void siteFailuresAreProblemJson() throws Exception {
        when(publication.document(HOST, "/", ANONYMOUS))
                .thenReturn(new DocumentRead("site_not_found", null, null, null, null, null, null));
        var missing = get("/api/content/site");
        assertThat(missing.getStatus()).isEqualTo(404);
        assertThat(missing.getContentType()).startsWith("application/problem+json");

        when(publication.document(HOST, "/", ANONYMOUS))
                .thenReturn(new DocumentRead("access_update_pending", HOST, null, siteId, null, null, context));
        var pending = get("/api/content/site");
        assertThat(pending.getStatus()).isEqualTo(503);
        assertThat(pending.getHeader("Retry-After")).isEqualTo("2");
    }

    @Test
    void pageReturnsDataWithTheCanonicalPathAndSnapshot() throws Exception {
        var page = page();
        when(publication.document(HOST, "/guide/install", ANONYMOUS)).thenReturn(read("ok", null, page));

        var response = get("/api/content/pages/guide/install");

        assertThat(response.getStatus()).isEqualTo(200);
        var body = json.readTree(response.getContentAsString());
        assertThat(body.get("id").asString()).isEqualTo(page.id().toString());
        assertThat(body.get("path").asString()).isEqualTo("/guide/install");
        assertThat(body.get("content").asString()).isEqualTo("# Install\n");
        assertThat(body.get("space").asString()).isEqualTo("guide");
        assertThat(body.get("snapshot").asString()).isEqualTo(siteId + ":" + spaceId + ":7");
        assertThat(body.get("contentProfile").isObject()).isTrue();
        assertThat(response.getHeader("Cache-Control")).contains("public").contains("no-cache");
        assertThat(get("/api/content/pages/guide/install", "If-None-Match", response.getHeader("ETag"))
                        .getStatus())
                .isEqualTo(304);
    }

    @Test
    void rootPathResolvesTheHomePage() throws Exception {
        when(publication.document(HOST, "/", ANONYMOUS)).thenReturn(read("ok", null, page()));

        assertThat(get("/api/content/pages").getStatus()).isEqualTo(200);
    }

    @Test
    void redirectsCarryAbsoluteLocationsAndStatusFromTheReadOutcome() throws Exception {
        when(publication.document(HOST, "/old", ANONYMOUS))
                .thenReturn(new DocumentRead("redirect", "www.example.com", null, siteId, null, null, context));
        var primary = get("/api/content/pages/old");
        assertThat(primary.getStatus()).isEqualTo(301);
        assertThat(primary.getHeader("Location")).isEqualTo("http://www.example.com/old");

        when(publication.document(HOST, "/moved", ANONYMOUS)).thenReturn(read("path_redirect", "/guide/新页", null));
        var moved = get("/api/content/pages/moved");
        assertThat(moved.getStatus()).isEqualTo(301);
        assertThat(moved.getHeader("Location")).isEqualTo("http://docs.example.com/guide/%E6%96%B0%E9%A1%B5");

        when(publication.document(HOST, "/guide", ANONYMOUS)).thenReturn(read("home_redirect", "/guide/install", null));
        var home = get("/api/content/pages/guide");
        assertThat(home.getStatus()).isEqualTo(302);
        assertThat(home.getHeader("Location")).isEqualTo("http://docs.example.com/guide/install");
        assertThat(home.getHeader("Vary")).isEqualTo("Cookie, Authorization");
    }

    @Test
    void attachmentsSeeOtherToTheSnapshotContentResource() throws Exception {
        var attachment = new SiteSnapshot.Attachment("img/a b.png", "key", "sha");
        when(publication.document(HOST, "/guide/img/a b.png", ANONYMOUS))
                .thenReturn(new DocumentRead("attachment", HOST, null, siteId, null, attachment, context));
        when(publication.mount(HOST, "guide", ANONYMOUS))
                .thenReturn(new PublicationPages.MountRead("ok", siteId + ":" + spaceId + ":7", "anonymous", space));

        var response = get("/api/content/pages/guide/img/a%20b.png");

        assertThat(response.getStatus()).isEqualTo(303);
        var location = org.springframework.web.util.UriComponentsBuilder.fromUriString(response.getHeader("Location"))
                .build();
        assertThat(location.getPath()).isEqualTo("/api/content/spaces/guide/content");
        var query = org.springframework.web.util.UriComponentsBuilder.fromUriString(response.getHeader("Location"))
                .build()
                .getQueryParams();
        assertThat(java.net.URLDecoder.decode(query.getFirst("snapshot"), java.nio.charset.StandardCharsets.UTF_8))
                .isEqualTo(siteId + ":" + spaceId + ":7");
        assertThat(java.net.URLDecoder.decode(query.getFirst("path"), java.nio.charset.StandardCharsets.UTF_8))
                .isEqualTo("/img/a b.png");
    }

    @Test
    void attachmentWithoutAMountIsProblem() throws Exception {
        var attachment = new SiteSnapshot.Attachment("a.png", "key", "sha");
        when(publication.document(HOST, "/guide/a.png", ANONYMOUS))
                .thenReturn(new DocumentRead("attachment", HOST, null, siteId, null, attachment, context));
        when(publication.mount(eq(HOST), eq("guide"), any()))
                .thenReturn(new PublicationPages.MountRead("forbidden", null, null, null));

        assertThat(get("/api/content/pages/guide/a.png").getStatus()).isEqualTo(403);
    }

    @Test
    void deniedMissingAndUnavailableReadsAreProblemJson() throws Exception {
        for (var entry : Map.of(
                        "forbidden", 403,
                        "page_not_found", 404,
                        "space_not_found", 404,
                        "invalid_token", 401,
                        "reader_session_invalid", 401,
                        "something_else", 503)
                .entrySet()) {
            when(publication.document(HOST, "/guide/x", ANONYMOUS)).thenReturn(read(entry.getKey(), null, null));
            var response = get("/api/content/pages/guide/x");
            assertThat(response.getStatus()).as(entry.getKey()).isEqualTo(entry.getValue());
            assertThat(response.getContentType()).startsWith("application/problem+json");
            assertThat(response.getHeader("Cache-Control")).contains("no-store");
        }
    }

    @Test
    void unreadableContextIsUnavailableAndControlCharactersAreInvalid() throws Exception {
        when(publication.document(HOST, "/guide/x", ANONYMOUS))
                .thenReturn(new DocumentRead("ok", HOST, null, siteId, null, null, context));
        assertThat(get("/api/content/pages/guide/x").getStatus()).isEqualTo(503);

        var strayPage = new SiteSnapshot.Page(
                UUID.randomUUID(),
                UUID.randomUUID(),
                null,
                "/z",
                "Z",
                "markdown",
                "h",
                "z",
                Map.of(),
                Map.of(),
                List.of(),
                null);
        when(publication.document(HOST, "/z", ANONYMOUS)).thenReturn(read("ok", null, strayPage));
        assertThat(get("/api/content/pages/z").getStatus()).isEqualTo(503);

        assertThat(get("/api/content/pages/a%01b").getStatus()).isEqualTo(422);
        assertThat(get("/api/content/pages/" + "a".repeat(600)).getStatus()).isEqualTo(422);
    }
}
