package io.space.control.entry.http.problem;

import static io.space.control.compositions.flow.ProblemCode.DEPENDENCY_TIMEOUT;
import static io.space.control.compositions.flow.ProblemCode.DEPENDENCY_UNAVAILABLE;
import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;

import jakarta.servlet.FilterChain;
import org.junit.jupiter.api.Test;
import org.springframework.dao.DataAccessResourceFailureException;
import org.springframework.dao.QueryTimeoutException;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.security.authentication.AuthenticationServiceException;

class DependencyFailureFilterTest {

    @Test
    void classifiesWrappedSecurityDependencyFailures() {
        var database = new DataAccessResourceFailureException("database unavailable");
        var wrapped = new AuthenticationServiceException("authentication dependency failed", database);

        var problem = ProblemResponseWriter.dependencyProblem(wrapped);

        assertThat(problem.status()).isEqualTo(503);
        assertThat(problem.code()).isEqualTo(DEPENDENCY_UNAVAILABLE);
    }

    @Test
    void preservesTimeoutAs504AtTheFilterBoundary() throws Exception {
        ProblemResponseWriter problems = mock(ProblemResponseWriter.class);
        var filter = new DependencyFailureFilter(problems);
        var request = new MockHttpServletRequest();
        var response = new MockHttpServletResponse();
        FilterChain chain = mock(FilterChain.class);
        var timeout = new QueryTimeoutException("database timed out");
        org.mockito.Mockito.doThrow(timeout).when(chain).doFilter(request, response);

        filter.doFilter(request, response, chain);

        verify(problems).writeDependencyFailure(request, response, timeout);
        assertThat(ProblemResponseWriter.dependencyProblem(timeout).code()).isEqualTo(DEPENDENCY_TIMEOUT);
    }
}
