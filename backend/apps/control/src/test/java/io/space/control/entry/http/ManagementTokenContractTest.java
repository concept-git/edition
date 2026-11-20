package io.space.control.entry.http;

import static org.assertj.core.api.Assertions.assertThat;

import java.nio.file.Files;
import java.nio.file.Path;
import org.junit.jupiter.api.Test;
import tools.jackson.databind.json.JsonMapper;

/** Generated-client compatibility: error annotations must not suppress successful response models. */
class ManagementTokenContractTest {
    @Test
    void everyProjectedResponseDeclaresFullAndPartialAlternatives() throws Exception {
        var api = JsonMapper.builder()
                .build()
                .readTree(Files.readString(Path.of(System.getProperty("space.backend.root"))
                        .getParent()
                        .resolve("contracts/openapi.json")));
        int checked = 0;
        for (var path : api.path("paths")) {
            var operation = path.path("get");
            boolean projection = false;
            for (var parameter : operation.path("parameters"))
                if (parameter.path("name").asString("").equals("fields")) projection = true;
            if (!projection) continue;
            for (var response : operation.path("responses").properties()) {
                if (!response.getKey().startsWith("2")) continue;
                for (var media : response.getValue().path("content")) {
                    assertThat(media.path("schema").path("anyOf").size())
                            .as(operation.path("operationId").asString())
                            .isEqualTo(2);
                    checked++;
                }
            }
        }
        assertThat(checked).isGreaterThan(0);
    }

    @Test
    void personalTokenResponsesExposeTheirSuccessfulModelsAndNeverPutSecretsInMetadata() throws Exception {
        var api = JsonMapper.builder()
                .build()
                .readTree(Files.readString(Path.of(System.getProperty("space.backend.root"))
                        .getParent()
                        .resolve("contracts/openapi.json")));
        var paths = api.get("paths");
        assertThat(paths.get("/api/v1/me/access-tokens")
                        .get("get")
                        .get("responses")
                        .get("200")
                        .get("content")
                        .get("application/json")
                        .get("schema")
                        .get("$ref")
                        .asString())
                .isEqualTo("#/components/schemas/ManagementTokenPage");
        assertThat(paths.get("/api/v1/auth/context")
                        .get("get")
                        .get("responses")
                        .get("200")
                        .get("content")
                        .get("application/json")
                        .get("schema")
                        .get("$ref")
                        .asString())
                .isEqualTo("#/components/schemas/ManagementAuthenticationContext");
        assertThat(paths.get("/api/v1/me/access-tokens/{tokenId}")
                        .get("delete")
                        .get("responses")
                        .has("204"))
                .isTrue();
        var schemas = api.get("components").get("schemas");
        assertThat(schemas.get("ManagementTokenView").get("properties").has("secret"))
                .isFalse();
        assertThat(schemas.get("IssuedManagementToken").get("properties").has("secret"))
                .isTrue();
        assertThat(schemas.get("ManagementAuthenticationContext")
                        .get("properties")
                        .has("credentialId"))
                .isTrue();
        assertThat(api.get("components")
                        .get("securitySchemes")
                        .get("bearerAuth")
                        .get("bearerFormat")
                        .asString())
                .contains("spm_");
    }
}
