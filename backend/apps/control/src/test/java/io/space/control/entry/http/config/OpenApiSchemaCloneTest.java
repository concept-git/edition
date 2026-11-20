package io.space.control.entry.http.config;

import static org.assertj.core.api.Assertions.assertThat;

import io.swagger.v3.oas.models.media.JsonSchema;
import java.util.Set;
import org.junit.jupiter.api.Test;
import org.springdoc.core.properties.SpringDocConfigProperties;
import org.springdoc.core.providers.ObjectMapperProvider;

@SuppressWarnings({"rawtypes", "unchecked"}) // Swagger exposes raw child schemas in its model API.
class OpenApiSchemaCloneTest {
    @Test
    void contentTypeValidationBindingsMatchNullableWireValuesAfterPartialClone() throws Exception {
        var properties = new SpringDocConfigProperties();
        properties.getApiDocs().setVersion(SpringDocConfigProperties.ApiDocs.OpenApiVersion.OPENAPI_3_1);
        var mappers = new ObjectMapperProvider(properties);
        var configuration = new OpenApiConfiguration();
        var api = configuration.spaceOpenApi(mappers);
        var schemas = new java.util.LinkedHashMap<>(api.getComponents().getSchemas());
        api.getComponents().setSchemas(schemas);
        schemas.putAll(io.swagger.v3.core.converter.ModelConverters.getInstance(true)
                .readAll(io.space.content.ContentTypeDefinition.class));
        schemas.put(
                "PartialContentTypeDefinition",
                mappers.jsonMapper()
                        .convertValue(
                                schemas.get("ContentTypeDefinition"), io.swagger.v3.oas.models.media.Schema.class));
        schemas.put(
                "PartialValidation",
                mappers.jsonMapper()
                        .convertValue(schemas.get("Validation"), io.swagger.v3.oas.models.media.Schema.class));
        configuration.managementVocabulary().customise(api);
        var clone = mappers.jsonMapper()
                .readValue(mappers.jsonMapper().writeValueAsBytes(api), io.swagger.v3.oas.models.OpenAPI.class);
        for (String name : java.util.List.of("ContentTypeDefinition", "PartialContentTypeDefinition")) {
            var validation = (io.swagger.v3.oas.models.media.Schema<?>)
                    clone.getComponents().getSchemas().get(name).getProperties().get("validation");
            assertThat(validation.getOneOf()).hasSize(2);
            assertThat(validation.getOneOf().getFirst().get$ref()).isEqualTo("#/components/schemas/Validation");
            assertThat(validation.getOneOf().getLast().getTypes()).containsExactly("null");
        }
        for (String name : java.util.List.of("Validation", "PartialValidation"))
            for (String field : java.util.List.of("schemaRef", "instanceSchemaPointer"))
                assertThat(((io.swagger.v3.oas.models.media.Schema<?>) clone.getComponents()
                                        .getSchemas()
                                        .get(name)
                                        .getProperties()
                                        .get(field))
                                .getTypes())
                        .containsExactlyInAnyOrder("string", "null");
    }

    @Test
    void arbitraryInterpretationRemainsAnObjectWithNullableVersionDuringOpenApiClone() throws Exception {
        var properties = new SpringDocConfigProperties();
        properties.getApiDocs().setVersion(SpringDocConfigProperties.ApiDocs.OpenApiVersion.OPENAPI_3_1);
        var mappers = new ObjectMapperProvider(properties);
        var api = new OpenApiConfiguration().spaceOpenApi(mappers);
        var clone = mappers.jsonMapper()
                .readValue(mappers.jsonMapper().writeValueAsBytes(api), io.swagger.v3.oas.models.OpenAPI.class);
        var conflict = clone.getComponents().getSchemas().get("Conflict");
        var interpretation = (io.swagger.v3.oas.models.media.Schema<?>)
                conflict.getProperties().get("currentInterpretation");
        assertThat(interpretation.getTypes()).contains("object", "null");
        assertThat(interpretation.getAdditionalProperties()).isEqualTo(true);
        var version = (io.swagger.v3.oas.models.media.Schema<?>)
                conflict.getProperties().get("currentVersionRef");
        assertThat(version.getTypes()).contains("string", "null");
    }

    @Test
    void wildcardJsonResponsesHaveTheSamePartialContractAsExplicitJson() {
        var properties = new SpringDocConfigProperties();
        properties.getApiDocs().setVersion(SpringDocConfigProperties.ApiDocs.OpenApiVersion.OPENAPI_3_1);
        var mappers = new ObjectMapperProvider(properties);
        var configuration = new OpenApiConfiguration();
        configuration.spaceOpenApi(mappers);
        var dto = new JsonSchema().type("object").addProperty("id", new JsonSchema().type("string"));
        dto.setRequired(java.util.List.of("id"));
        var map = new JsonSchema().type("object");
        map.setAdditionalProperties(new JsonSchema().type("string"));
        dto.addProperty("labels", map);
        var content = new io.swagger.v3.oas.models.media.Content();
        for (String media : java.util.List.of("application/json", "*/*"))
            content.addMediaType(
                    media,
                    new io.swagger.v3.oas.models.media.MediaType()
                            .schema(new JsonSchema().$ref("#/components/schemas/Detail")));
        var operation = new io.swagger.v3.oas.models.Operation()
                .addParametersItem(new io.swagger.v3.oas.models.parameters.QueryParameter().name("fields"))
                .responses(new io.swagger.v3.oas.models.responses.ApiResponses()
                        .addApiResponse("200", new io.swagger.v3.oas.models.responses.ApiResponse().content(content)));
        var api = new io.swagger.v3.oas.models.OpenAPI()
                .components(new io.swagger.v3.oas.models.Components().addSchemas("Detail", dto))
                .paths(new io.swagger.v3.oas.models.Paths()
                        .addPathItem("/detail", new io.swagger.v3.oas.models.PathItem().get(operation)));
        configuration.partialReadResponses(mappers).customise(api);
        for (var body : content.values())
            assertThat(body.getSchema().getAnyOf()).hasSize(2);
        assertThat(api.getComponents().getSchemas().get("PartialDetail").getRequired())
                .isNull();
        assertThat(((io.swagger.v3.oas.models.media.Schema<?>) api.getComponents()
                                .getSchemas()
                                .get("PartialDetail")
                                .getProperties()
                                .get("labels"))
                        .getAdditionalProperties())
                .isInstanceOf(io.swagger.v3.oas.models.media.Schema.class);
        assertThat(dto.getRequired()).containsExactly("id");
    }

    @Test
    void nullableReferencesAreAUnionRatherThanContradictoryConstraints() {
        var reference = new JsonSchema();
        reference.set$ref("#/components/schemas/Branding");
        reference.setTypes(Set.of("null"));
        var request = new JsonSchema();
        request.addProperty("branding", reference);
        var api = new io.swagger.v3.oas.models.OpenAPI()
                .components(new io.swagger.v3.oas.models.Components()
                        .addSchemas("Request", request)
                        .addSchemas("Branding", new JsonSchema().type("object")));
        new OpenApiConfiguration().managementVocabulary().customise(api);
        assertThat(reference.get$ref()).isNull();
        assertThat(reference.getTypes()).isNull();
        assertThat(reference.getAnyOf()).hasSize(2);
        assertThat(reference.getAnyOf().getFirst().get$ref()).isEqualTo("#/components/schemas/Branding");
        assertThat(reference.getAnyOf().getLast().getTypes()).containsExactly("null");
    }

    @Test
    void schemaCloneAcceptsBothScalarAndUnionTypesWithoutFallingBack() throws Exception {
        var properties = new SpringDocConfigProperties();
        properties.getApiDocs().setVersion(SpringDocConfigProperties.ApiDocs.OpenApiVersion.OPENAPI_3_1);
        var mappers = new ObjectMapperProvider(properties);
        new OpenApiConfiguration().spaceOpenApi(mappers);
        var mapper = mappers.jsonMapper();

        for (Set<String> types : java.util.List.of(Set.of("string"), Set.of("string", "null"))) {
            var schema = new JsonSchema();
            schema.setTypes(types);
            schema.setDescription("retained during clone");
            // 直接验证克隆，不使用库的“失败时返回原对象”降级路径。
            var clone = mapper.readValue(mapper.writeValueAsBytes(schema), JsonSchema.class);
            assertThat(clone).isNotSameAs(schema);
            assertThat(clone.getTypes()).isEqualTo(types);
            assertThat(clone.getDescription()).isEqualTo(schema.getDescription());
        }
    }
}
