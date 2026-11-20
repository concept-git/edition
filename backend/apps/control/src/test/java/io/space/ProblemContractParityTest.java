package io.space;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.tngtech.archunit.core.domain.JavaFieldAccess;
import com.tngtech.archunit.core.importer.ClassFileImporter;
import io.space.control.compositions.flow.ProblemCode;
import io.space.control.entry.http.problem.ApiProblem;
import io.swagger.v3.core.converter.ModelConverters;
import io.swagger.v3.oas.models.media.Schema;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Arrays;
import java.util.LinkedHashSet;
import java.util.Set;
import java.util.stream.Collectors;
import org.junit.jupiter.api.Test;

class ProblemContractParityTest {

    @Test
    void openApiProblemCodesExactlyMatchBackendEnum() throws IOException {
        var catalog =
                Arrays.stream(ProblemCode.values()).map(ProblemCode::value).collect(Collectors.toUnmodifiableSet());

        var generatedSchemas = ModelConverters.getInstance().readAll(ApiProblem.class);
        var generatedCodeSchema =
                (Schema<?>) generatedSchemas.get("ApiProblem").getProperties().get("code");
        var generated = enumValues(generatedSchemas, generatedCodeSchema);

        var contract = new ObjectMapper().readTree(Files.readString(contractPath()));
        var codeSchema = contract.at("/components/schemas/ApiProblem/properties/code");
        var committed = enumValues(contract, codeSchema);

        assertThat(generated).containsExactlyInAnyOrderElementsOf(catalog);
        assertThat(committed).containsExactlyInAnyOrderElementsOf(catalog);
        assertParity(catalog, gatewayMappings(), reservedCodes(), committed);
    }

    @Test
    void backendMappingMissingFromOpenApiIsRejected() {
        assertThatThrownBy(() -> assertParity(
                        Set.of("mapped", "backend_only"), Set.of("mapped", "backend_only"), Set.of(), Set.of("mapped")))
                .isInstanceOf(AssertionError.class)
                .hasMessageContaining("backend_only")
                .hasMessageContaining("OpenAPI");
    }

    @Test
    void openApiCodeWithoutBackendMappingOrReservationIsRejected() {
        assertThatThrownBy(() -> assertParity(
                        Set.of("mapped", "contract_only"),
                        Set.of("mapped"),
                        Set.of(),
                        Set.of("mapped", "contract_only")))
                .isInstanceOf(AssertionError.class)
                .hasMessageContaining("contract_only")
                .hasMessageContaining("mapping or explicit reservation");
    }

    private static void assertParity(
            Set<String> catalog, Set<String> mappings, Set<String> reserved, Set<String> openApi) {
        var violations = new LinkedHashSet<String>();
        mappings.stream()
                .filter(code -> !catalog.contains(code))
                .forEach(code -> violations.add("backend mapping missing from catalog: " + code));
        mappings.stream()
                .filter(code -> !openApi.contains(code))
                .forEach(code -> violations.add("backend mapping missing from OpenAPI: " + code));
        openApi.stream()
                .filter(code -> !catalog.contains(code))
                .forEach(code -> violations.add("OpenAPI code missing from catalog: " + code));
        catalog.stream()
                .filter(code -> !mappings.contains(code) && !reserved.contains(code))
                .forEach(
                        code -> violations.add("catalog code has no backend mapping or explicit reservation: " + code));
        reserved.stream()
                .filter(code -> !catalog.contains(code))
                .forEach(code -> violations.add("reservation missing from catalog: " + code));

        assertThat(violations)
                .as("problem-code catalog / gateway mapping / OpenAPI parity")
                .isEmpty();
    }

    private static Set<String> gatewayMappings() {
        var constantsByField = Arrays.stream(ProblemCode.values())
                .collect(Collectors.toUnmodifiableMap(ProblemCode::name, ProblemCode::value));
        return new ClassFileImporter()
                .importPackages("io.space.control.entry.http").stream()
                        .flatMap(type -> type.getFieldAccessesFromSelf().stream())
                        .map(JavaFieldAccess::getTarget)
                        .filter(target -> target.getOwner().getName().equals(ProblemCode.class.getName()))
                        .map(target -> constantsByField.get(target.getName()))
                        .filter(java.util.Objects::nonNull)
                        .collect(Collectors.toUnmodifiableSet());
    }

    private static Set<String> reservedCodes() {
        return Arrays.stream(ProblemCode.values())
                .filter(ProblemCode::reserved)
                .map(ProblemCode::value)
                .collect(Collectors.toUnmodifiableSet());
    }

    private static Set<String> enumValues(java.util.Map<String, Schema> schemas, Schema<?> codeSchema) {
        var resolved = codeSchema.get$ref() == null
                ? codeSchema
                : schemas.get(
                        codeSchema.get$ref().substring(codeSchema.get$ref().lastIndexOf('/') + 1));
        return resolved.getEnum().stream().map(Object::toString).collect(Collectors.toUnmodifiableSet());
    }

    private static Set<String> enumValues(JsonNode contract, JsonNode codeSchema) {
        var resolved = codeSchema.has("$ref")
                ? contract.at(codeSchema.get("$ref").asText().substring(1))
                : codeSchema;
        return resolved.path("enum").valueStream().map(JsonNode::asText).collect(Collectors.toUnmodifiableSet());
    }

    private static Path contractPath() {
        var fromBackend = SourceLayout.REPOSITORY
                .resolve("contracts/openapi.json")
                .toAbsolutePath()
                .normalize();
        if (Files.exists(fromBackend)) {
            return fromBackend;
        }
        return Path.of("contracts/openapi.json").toAbsolutePath().normalize();
    }
}
