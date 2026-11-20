package io.space;

import static org.assertj.core.api.Assertions.assertThat;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.space.control.compositions.hosting.reorganization.ReorganizationTypes;
import io.space.control.compositions.iam.membership.MembershipTypes;
import io.space.control.compositions.iam.team.TeamTypes;
import io.space.control.compositions.platform.mailadmin.MailAdminTypes;
import io.space.control.compositions.platform.pluginmanagement.PluginManagementTypes;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Arrays;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import org.junit.jupiter.api.Test;

/** 回放返回的是序列化 JSON；契约仍必须描述真实业务对象，而不是 Java String。 */
class SuccessResponseContractTest {
    record Response(String operation, String status, Class<?> payload) {}

    @Test
    void replayedAndSameNamedResponsesKeepTheirActualRecordFields() throws Exception {
        Path path = SourceLayout.REPOSITORY.resolve("contracts/openapi.json");
        if (!Files.exists(path)) path = Path.of("contracts/openapi.json");
        JsonNode api = new ObjectMapper().readTree(Files.readString(path));
        for (var expected : List.of(
                new Response("create", "201", TeamTypes.TeamView.class),
                new Response("invite", "201", TeamTypes.IssuedInvite.class),
                new Response("acceptInvitation", "200", MembershipTypes.Accepted.class),
                new Response("retryMailJob", "200", MailAdminTypes.MailJob.class),
                new Response("createRedirect", "200", ReorganizationTypes.RedirectView.class),
                new Response("createPluginDevelopment", "201", PluginManagementTypes.Development.class),
                new Response("savePluginDevelopment", "200", PluginManagementTypes.Development.class),
                new Response("compilePluginCandidate", "201", PluginManagementTypes.Candidate.class),
                new Response("verifyPluginCandidate", "201", PluginManagementTypes.Verification.class))) {
            JsonNode operation = null;
            for (var resource : api.path("paths"))
                for (var method : resource)
                    if (method.path("operationId").asText().equals(expected.operation())) operation = method;
            assertThat(operation).as(expected.operation()).isNotNull();
            JsonNode content =
                    operation.path("responses").path(expected.status()).path("content");
            assertThat(content.isEmpty()).as(expected.operation()).isFalse();
            JsonNode schema = content.elements().next().path("schema");
            assertThat(schema.has("$ref")).as(expected.operation()).isTrue();
            JsonNode model = api.at(schema.path("$ref").asText().substring(1));
            Set<String> fields = new HashSet<>();
            model.path("properties").fieldNames().forEachRemaining(fields::add);
            assertThat(fields)
                    .as(expected.operation())
                    .containsExactlyInAnyOrderElementsOf(
                            Arrays.stream(expected.payload().getRecordComponents())
                                    .map(java.lang.reflect.RecordComponent::getName)
                                    .toList());
        }
    }
}
