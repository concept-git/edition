package io.space.control.entry.http.problem;

import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.not;
import static org.mockito.Mockito.mock;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import io.micrometer.tracing.Tracer;
import io.space.control.compositions.iam.accountsession.ProfileRejectedException;
import io.space.control.entry.http.security.RequestIdFilter;
import io.space.shared.ValidationViolation;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.dao.DataAccessResourceFailureException;
import org.springframework.dao.QueryTimeoutException;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

class FailureSemanticsProblemTest {

    @Test
    void dependencyAndInvariantFailuresRemainDistinctAndDoNotLeakCauses() throws Exception {
        var mvc = mvc();

        mvc.perform(get("/database").header(RequestIdFilter.HEADER, "database-503"))
                .andExpect(status().isServiceUnavailable())
                .andExpect(jsonPath("$.code").value("dependency_unavailable"))
                .andExpect(jsonPath("$.traceId").value("database-503"))
                .andExpect(content().string(not(containsString("jdbc:postgresql"))))
                .andExpect(content().string(not(containsString("secret-password"))));

        mvc.perform(get("/timeout").header(RequestIdFilter.HEADER, "database-504"))
                .andExpect(status().isGatewayTimeout())
                .andExpect(jsonPath("$.code").value("dependency_timeout"))
                .andExpect(jsonPath("$.traceId").value("database-504"));

        mvc.perform(get("/unexpected").header(RequestIdFilter.HEADER, "invariant-500"))
                .andExpect(status().isInternalServerError())
                .andExpect(jsonPath("$.code").value("unexpected_error"))
                .andExpect(jsonPath("$.traceId").value("invariant-500"))
                .andExpect(content().string(not(containsString("secret invariant detail"))));
    }

    @Test
    void failedRollbackAndConnectionAcquisitionRemainDependencyFailures() throws Exception {
        for (String path : List.of("/rollback", "/connection")) {
            mvc().perform(get(path).header(RequestIdFilter.HEADER, "wrapped-503"))
                    .andExpect(status().isServiceUnavailable())
                    .andExpect(jsonPath("$.code").value("dependency_unavailable"))
                    .andExpect(jsonPath("$.traceId").value("wrapped-503"));
        }
        for (String path : List.of("/transaction-invariant", "/sql-invariant", "/data-api-invariant")) {
            mvc().perform(get(path))
                    .andExpect(status().isInternalServerError())
                    .andExpect(jsonPath("$.code").value("unexpected_error"));
        }
    }

    @Test
    void profileRejectionCarriesStableViolationsInsteadOfExceptionText() throws Exception {
        mvc().perform(get("/profile").header(RequestIdFilter.HEADER, "profile-422"))
                .andExpect(status().isUnprocessableContent())
                .andExpect(jsonPath("$.code").value("profile_invalid"))
                .andExpect(jsonPath("$.violations[0].field").value("avatar"))
                .andExpect(jsonPath("$.violations[0].code").value("https_required"))
                .andExpect(content().string(not(containsString("internal profile reason"))));
    }

    @Test
    void protocolMistakesRemainClientErrors() throws Exception {
        var mvc = mvc();
        mvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post("/profile"))
                .andExpect(status().isMethodNotAllowed())
                .andExpect(org.springframework.test.web.servlet.result.MockMvcResultMatchers.header()
                        .string("Allow", containsString("GET")))
                .andExpect(jsonPath("$.code").value("method_not_allowed"));
        mvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post("/json")
                        .contentType("text/plain")
                        .content("plain"))
                .andExpect(status().isUnsupportedMediaType())
                .andExpect(jsonPath("$.code").value("media_type_not_supported"));
        mvc.perform(get("/parameter"))
                .andExpect(status().isUnprocessableContent())
                .andExpect(jsonPath("$.code").value("validation_failed"));
    }

    @SuppressWarnings("unchecked")
    private static org.springframework.test.web.servlet.MockMvc mvc() {
        ObjectProvider<Tracer> tracer = mock(ObjectProvider.class);
        var advice = new GatewayExceptionHandler(new ProblemResponses(new RequestTrace(tracer)));
        return MockMvcBuilders.standaloneSetup(new FailureController())
                .setControllerAdvice(advice)
                .addFilter(new RequestIdFilter())
                .build();
    }

    @RestController
    private static final class FailureController {

        @org.springframework.web.bind.annotation.PostMapping(value = "/json", consumes = "application/json")
        String json(@org.springframework.web.bind.annotation.RequestBody String body) {
            return body;
        }

        @GetMapping("/parameter")
        String parameter(@org.springframework.web.bind.annotation.RequestParam String required) {
            return required;
        }

        @GetMapping("/rollback")
        void rollback() {
            var failure = new org.springframework.transaction.TransactionSystemException(
                    "JDBC rollback failed", new java.sql.SQLException("Connection is closed"));
            failure.initApplicationException(new DataAccessResourceFailureException("connection lost"));
            throw failure;
        }

        @GetMapping("/connection")
        void connection() {
            throw new org.springframework.transaction.CannotCreateTransactionException(
                    "cannot begin", new java.sql.SQLTransientConnectionException("pool unavailable"));
        }

        @GetMapping("/transaction-invariant")
        void transactionInvariant() {
            throw new org.springframework.transaction.TransactionSystemException(
                    "invariant", new IllegalStateException("bug"));
        }

        @GetMapping("/sql-invariant")
        void sqlInvariant() {
            var failure = new org.springframework.transaction.TransactionSystemException("transaction failed");
            failure.initApplicationException(new org.springframework.jdbc.BadSqlGrammarException(
                    "query", "invalid SQL", new java.sql.SQLException("syntax error", "42601")));
            throw failure;
        }

        @GetMapping("/data-api-invariant")
        void dataApiInvariant() {
            var failure = new org.springframework.transaction.TransactionSystemException("transaction failed");
            failure.initApplicationException(
                    new org.springframework.dao.InvalidDataAccessApiUsageException("incorrect arguments"));
            throw failure;
        }

        @GetMapping("/database")
        void database() {
            throw new DataAccessResourceFailureException("jdbc:postgresql://database secret-password");
        }

        @GetMapping("/timeout")
        void timeout() {
            throw new QueryTimeoutException("database timed out");
        }

        @GetMapping("/unexpected")
        void unexpected() {
            throw new IllegalStateException("secret invariant detail");
        }

        @GetMapping("/profile")
        void profile() {
            throw new ProfileRejectedException(List.of(new ValidationViolation("avatar", "https_required")));
        }
    }
}
