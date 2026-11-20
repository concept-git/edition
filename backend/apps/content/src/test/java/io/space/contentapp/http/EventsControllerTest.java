package io.space.contentapp.entry.http;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import io.space.delivery.contract.SiteSnapshot;
import io.space.contentapp.compositions.access.ContentIdentity;
import io.space.contentapp.compositions.access.ContentIdentity.PublicationCredential;
import io.space.contentapp.compositions.shared.ContentProblem;
import io.space.contentapp.entry.observability.ContentAnalytics;
import io.space.contentapp.entry.persistence.PublicationPages;
import io.space.contentapp.entry.persistence.PublicationPages.DocumentRead;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

class EventsControllerTest {
    private static final String HOST = "docs.example.com";
    private static final String ORIGIN = "http://docs.example.com";
    private static final PublicationCredential ANONYMOUS = PublicationCredential.ANONYMOUS;

    private PublicationPages publication;
    private ContentAnalytics analytics;
    private MockMvc mvc;

    @BeforeEach
    void setUp() {
        publication = mock(PublicationPages.class);
        analytics = mock(ContentAnalytics.class);
        mvc = MockMvcBuilders.standaloneSetup(new EventsController(
                        publication, new ContentIdentity(), new ContentRequestOrigin(List.of()), analytics))
                .setControllerAdvice(new ContentErrors())
                .build();
    }

    private MockHttpServletResponse post(String origin, String body) throws Exception {
        var request = MockMvcRequestBuilders.post("/api/content/events")
                .header("Host", HOST)
                .contentType(MediaType.APPLICATION_JSON)
                .content(body);
        if (origin != null) request.header("Origin", origin);
        return mvc.perform(request).andReturn().getResponse();
    }

    private static DocumentRead read(String outcome, SiteSnapshot.Page page) {
        return new DocumentRead(outcome, HOST, null, UUID.randomUUID(), page, null, null);
    }

    private static SiteSnapshot.Page page() {
        return new SiteSnapshot.Page(
                UUID.randomUUID(),
                UUID.randomUUID(),
                null,
                "/guide/install",
                "Install",
                "markdown",
                "h",
                "x",
                Map.of(),
                Map.of(),
                List.of(),
                null);
    }

    @Test
    void readablePageIsRecordedWithTheCanonicalPath() throws Exception {
        var page = page();
        when(publication.document(HOST, "/guide/install", ANONYMOUS)).thenReturn(read("ok", page));

        var response = post(ORIGIN, "{\"kind\":\"pv\",\"path\":\"/guide/install\",\"referrer\":\"https://a.test/x\"}");

        assertThat(response.getStatus()).isEqualTo(202);
        assertThat(response.getHeader("Cache-Control")).contains("no-store");
        verify(analytics).admit(Mockito.eq(HOST), any());
        verify(analytics)
                .pageViewed(Mockito.eq(page.id()), Mockito.eq("/guide/install"), Mockito.eq("https://a.test/x"), any());
    }

    @Test
    void missingPathIsRecordedOnlyWhenTheReadContractSaysSo() throws Exception {
        when(publication.document(HOST, "/gone", ANONYMOUS)).thenReturn(read("page_not_found", null));

        assertThat(post(ORIGIN, "{\"kind\":\"notfound\",\"path\":\"/gone\"}").getStatus())
                .isEqualTo(202);
        verify(analytics).notFound(Mockito.eq("/gone"), Mockito.isNull(), any());
    }

    @Test
    void mismatchedKindsAreRejectedWithoutRecording() throws Exception {
        when(publication.document(HOST, "/guide/install", ANONYMOUS)).thenReturn(read("ok", page()));
        when(publication.document(HOST, "/gone", ANONYMOUS)).thenReturn(read("page_not_found", null));
        when(publication.document(HOST, "/old", ANONYMOUS)).thenReturn(read("path_redirect", null));
        when(publication.document(HOST, "/private", ANONYMOUS)).thenReturn(read("forbidden", null));

        for (var body : List.of(
                "{\"kind\":\"notfound\",\"path\":\"/guide/install\"}",
                "{\"kind\":\"pv\",\"path\":\"/gone\"}",
                "{\"kind\":\"pv\",\"path\":\"/old\"}",
                "{\"kind\":\"pv\",\"path\":\"/private\"}")) {
            var response = post(ORIGIN, body);
            assertThat(response.getStatus()).as(body).isEqualTo(422);
            assertThat(response.getContentType()).startsWith("application/problem+json");
        }
        verify(analytics, never()).pageViewed(any(), any(), any(), any());
        verify(analytics, never()).notFound(any(), any(), any());
    }

    @Test
    void invalidBodiesAreUnprocessable() throws Exception {
        for (var body : List.of(
                "{\"kind\":\"click\",\"path\":\"/a\"}",
                "{\"kind\":\"pv\"}",
                "{\"kind\":\"pv\",\"path\":\"a\"}",
                "{\"kind\":\"pv\",\"path\":\"/a\\u0001\"}",
                "{\"kind\":\"pv\",\"path\":\"/" + "a".repeat(600) + "\"}",
                "{not json")) {
            assertThat(post(ORIGIN, body).getStatus()).as(body).isEqualTo(422);
        }
    }

    @Test
    void foreignOrMissingOriginIsForbidden() throws Exception {
        assertThat(post("http://evil.example", "{\"kind\":\"pv\",\"path\":\"/a\"}")
                        .getStatus())
                .isEqualTo(403);
        assertThat(post(null, "{\"kind\":\"pv\",\"path\":\"/a\"}").getStatus()).isEqualTo(403);
        verify(analytics, never()).admit(any(), any());
    }

    @Test
    void rateLimitAndUnknownSitesSurfaceAsProblems() throws Exception {
        Mockito.doThrow(new ContentProblem(429, "read_limit_exceeded"))
                .when(analytics)
                .admit(any(), any());
        var limited = post(ORIGIN, "{\"kind\":\"pv\",\"path\":\"/a\"}");
        assertThat(limited.getStatus()).isEqualTo(429);
        assertThat(limited.getHeader("Retry-After")).isEqualTo("2");

        Mockito.doNothing().when(analytics).admit(any(), any());
        when(publication.document(HOST, "/a", ANONYMOUS))
                .thenReturn(new DocumentRead("site_not_found", null, null, null, null, null, null));
        assertThat(post(ORIGIN, "{\"kind\":\"pv\",\"path\":\"/a\"}").getStatus())
                .isEqualTo(404);
    }
}
