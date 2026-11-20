package io.space.control.entry.http.problem;

import static org.mockito.Mockito.mock;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import io.micrometer.tracing.Tracer;
import io.space.control.compositions.access.PermissionDeniedException;
import io.space.control.compositions.principal.UnresolvedPrincipalException;
import io.space.control.entry.http.security.RequestIdFilter;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

class PermissionDeniedProblemTest {

    @Test
    @SuppressWarnings("unchecked")
    void guardDenialUsesTheUnifiedProblemJsonExit() throws Exception {
        ObjectProvider<Tracer> tracer = mock(ObjectProvider.class);
        var advice = new GatewayExceptionHandler(new ProblemResponses(new RequestTrace(tracer)));
        var mvc = MockMvcBuilders.standaloneSetup(new DeniedController())
                .setControllerAdvice(advice)
                .addFilter(new RequestIdFilter())
                .build();

        mvc.perform(get("/denied").header(RequestIdFilter.HEADER, "request-403"))
                .andExpect(status().isForbidden())
                .andExpect(content().contentType("application/problem+json"))
                .andExpect(jsonPath("$.code").value("permission_denied"))
                .andExpect(jsonPath("$.traceId").value("request-403"));
    }

    @Test
    @SuppressWarnings("unchecked")
    void unresolvedCredentialUsesTheAuthenticationProblemExit() throws Exception {
        ObjectProvider<Tracer> tracer = mock(ObjectProvider.class);
        var advice = new GatewayExceptionHandler(new ProblemResponses(new RequestTrace(tracer)));
        var mvc = MockMvcBuilders.standaloneSetup(new DeniedController())
                .setControllerAdvice(advice)
                .addFilter(new RequestIdFilter())
                .build();

        mvc.perform(get("/unresolved").header(RequestIdFilter.HEADER, "request-401"))
                .andExpect(status().isUnauthorized())
                .andExpect(content().contentType("application/problem+json"))
                .andExpect(jsonPath("$.code").value("authentication_required"))
                .andExpect(jsonPath("$.traceId").value("request-401"));
    }

    @RestController
    private static final class DeniedController {
        @GetMapping("/denied")
        void denied() {
            throw new PermissionDeniedException();
        }

        @GetMapping("/unresolved")
        void unresolved() {
            throw new UnresolvedPrincipalException();
        }
    }
}
