package io.space.control.entry.http.reader;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import io.space.control.compositions.hosting.readersecurity.ReaderCommands;
import java.util.Set;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.springframework.dao.DataAccessResourceFailureException;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;

class ReaderContinueFormTest {
    @ParameterizedTest
    @ValueSource(
            strings = {
                "https://evil.test",
                "//evil.test",
                "/\\evil.test",
                "docs",
                "/a\nb",
                "/a%0Ab",
                "/%2F%2Fevil.test",
                "/%5Cevil.test",
                "/%252525252F",
                "/a b",
                "/%zz"
            })
    void unsafeReturnTargetsFallBackToRoot(String candidate) {
        assertThat(ReturnTarget.of(candidate)).isEqualTo("/");
    }

    @Test
    void oversizedOrMissingTargetsFallBackAndSafeOnesSurvive() {
        assertThat(ReturnTarget.of(null)).isEqualTo("/");
        assertThat(ReturnTarget.of("")).isEqualTo("/");
        assertThat(ReturnTarget.of("/" + "a".repeat(ReturnTarget.MAX_LENGTH))).isEqualTo("/");
        assertThat(ReturnTarget.of("/" + "a".repeat(ReturnTarget.MAX_LENGTH - 1)))
                .hasSize(ReturnTarget.MAX_LENGTH);
        assertThat(ReturnTarget.of("/docs/%E4%B8%AD?q=1+2#top")).isEqualTo("/docs/%E4%B8%AD?q=1+2#top");
    }

    @Test
    void dependencyFailureRendersRequestIdAndKeepsCredentials() {
        var commands = mock(ReaderCommands.class);
        when(commands.destination(any())).thenThrow(new DataAccessResourceFailureException("down"));
        var controller = new ReaderCommandController(commands, Set.of("127.0.0.1"));
        var request = new MockHttpServletRequest("POST", "/_auth/session/refresh");
        request.setSecure(true);
        request.addHeader("Host", "docs.acme.test");
        request.addHeader("Origin", "https://docs.acme.test");
        request.setScheme("https");
        var response = new MockHttpServletResponse();

        var result = controller.renewForm("/docs?a=1&b=2", request, response);

        assertThat(result.getStatusCode().value()).isEqualTo(503);
        assertThat(result.getHeaders().getFirst("Retry-After")).isEqualTo("5");
        assertThat(result.getHeaders().getFirst("Cache-Control")).contains("no-store");
        assertThat((String) result.getBody())
                .contains("href=\"/docs?a=1&amp;b=2\"", "<code>unknown</code>")
                .doesNotContain("a=1&b");
        assertThat(response.getHeaders("Set-Cookie")).isEmpty();
        verify(commands, never()).refresh(any(), any());
    }

    @Test
    void failuresThatAreNotDependencyProblemsPropagate() {
        var commands = mock(ReaderCommands.class);
        when(commands.destination(any())).thenThrow(new IllegalStateException("bug"));
        var controller = new ReaderCommandController(commands, Set.of("127.0.0.1"));
        var request = new MockHttpServletRequest("POST", "/_auth/session/refresh");
        request.addHeader("Host", "docs.acme.test");
        request.addHeader("Origin", "https://docs.acme.test");
        request.setScheme("https");
        request.setSecure(true);

        org.assertj.core.api.Assertions.assertThatThrownBy(
                        () -> controller.renewForm("/", request, new MockHttpServletResponse()))
                .isInstanceOf(IllegalStateException.class);
    }
}
