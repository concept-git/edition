package io.edition.control.entry.http.config;

import io.edition.control.entry.http.problem.ApiProblem;
import io.swagger.v3.core.converter.ModelConverters;
import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springdoc.core.providers.ObjectMapperProvider;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/** 契约根定义；具体 path 只从真实 controller 生成，避免手写 operation 覆盖运行时响应。 */
@Configuration
class OpenApiConfiguration {
    @Bean
    org.springdoc.core.customizers.OperationCustomizer controlCapabilities() {
        return (operation, handler) -> {
            if (FieldProjectionAdvice.eligible(handler.getMethod())) {
                operation.addParametersItem(new io.swagger.v3.oas.models.parameters.QueryParameter()
                        .name("fields")
                        .description(
                                "Optional response field mask. Select fields from this operation's response schema; omit for the full response. Keep nextCursor when paginating; select dynamic maps whole.")
                        .schema(new io.swagger.v3.oas.models.media.StringSchema()
                                .minLength(1)
                                .maxLength(4096)));
            }
            String http = handler.getMethodAnnotation(org.springframework.web.bind.annotation.GetMapping.class) != null
                    ? "GET"
                    : "POST";
            String scope = io.edition.control.compositions.access.ManagementCapabilities.requiredScope(
                    handler.getBeanType().getSimpleName(), handler.getMethod().getName(), http);
            operation.addExtension("x-management-scope", scope == null ? "session-only" : scope);
            String type = handler.getBeanType().getSimpleName();
            String method = handler.getMethod().getName();
            operation.addExtension(
                    "x-read-only",
                    io.edition.control.compositions.access.ManagementCapabilities.readOnly(type, method, http));
            if (operation.getParameters() != null)
                for (var parameter : operation.getParameters()) {
                    if (parameter.getName().equals("Idempotency-Key") && parameter.getSchema() == null)
                        parameter.setSchema(new io.swagger.v3.oas.models.media.StringSchema()
                                .minLength(1)
                                .maxLength(128)
                                .pattern("^[a-zA-Z0-9._:-]+$"));
                }
            boolean spaceToken = type.equals("ManagementTokenController") && method.equals("context")
                    || type.equals("SpaceController")
                            && java.util.Set.of("view", "list").contains(method)
                    || type.equals("PageController")
                            && java.util.Set.of(
                                            "view",
                                            "content",
                                            "batchGet",
                                            "list",
                                            "revisions",
                                            "revision",
                                            "diff",
                                            "preview",
                                            "create",
                                            "edit")
                                    .contains(method);
            operation.addExtension(
                    "x-credential-types",
                    spaceToken
                            ? java.util.List.of("session", "management_token", "space_token")
                            : scope == null
                                    ? java.util.List.of("session")
                                    : java.util.List.of("session", "management_token"));
            if (type.equals("AvailabilityController")
                    || type.equals("AuthRegistrationController")
                    || type.equals("InvitationController") && method.equals("preview")
                    || type.equals("AuthSessionController") && method.equals("login")
                    || type.equals("AuthPasswordController")
                            && java.util.Set.of("forgot", "reset").contains(method)) {
                operation.addExtension("x-credential-types", java.util.List.of("anonymous"));
                operation.addExtension("x-management-scope", "");
            }
            return operation;
        };
    }

    @Bean
    @SuppressWarnings({"rawtypes", "unchecked"}) // Swagger Schema exposes a raw items setter.
    org.springdoc.core.customizers.OpenApiCustomizer managementVocabulary() {
        return api -> {
            var schemas = api.getComponents().getSchemas();
            // Passive content records serialize absent validation bindings as JSON null.
            var nullSchema = new io.swagger.v3.oas.models.media.JsonSchema();
            nullSchema.setTypes(java.util.Set.of("null"));
            for (String name : java.util.List.of("ContentTypeDefinition", "PartialContentTypeDefinition")) {
                var definition = schemas.get(name);
                if (definition != null
                        && definition.getProperties() != null
                        && definition.getProperties().get("validation")
                                instanceof io.swagger.v3.oas.models.media.Schema field
                        && field.get$ref() != null)
                    definition.addProperty(
                            "validation",
                            new io.swagger.v3.oas.models.media.ComposedSchema()
                                    .addOneOfItem(field)
                                    .addOneOfItem(nullSchema));
            }
            for (String name : java.util.List.of("Validation", "PartialValidation")) {
                var validation = schemas.get(name);
                if (validation != null && validation.getProperties() != null)
                    for (String field : java.util.List.of("schemaRef", "instanceSchemaPointer")) {
                        var property = (io.swagger.v3.oas.models.media.Schema)
                                validation.getProperties().get(field);
                        if (property != null) {
                            property.setType(null);
                            property.setTypes(new java.util.LinkedHashSet<>(java.util.List.of("string", "null")));
                        }
                    }
            }
            schemas.values().forEach(OpenApiConfiguration::nullableEnums);
            var scopes = io.edition.control.compositions.access.ManagementScopeCatalog.values();
            for (String name : java.util.List.of("IssueRequest", "ManagementTokenView")) {
                var schema = schemas.get(name);
                if (schema != null
                        && schema.getProperties() != null
                        && schema.getProperties().get("scopes") instanceof io.swagger.v3.oas.models.media.Schema field
                        && field.getItems() != null) field.getItems().setEnum(scopes);
            }
        };
    }

    @Bean
    org.springdoc.core.customizers.OpenApiCustomizer partialReadResponses(ObjectMapperProvider mappers) {
        return api -> api.getPaths().values().forEach(path -> {
            var operation = path.getGet();
            if (operation == null
                    || operation.getParameters() == null
                    || operation.getParameters().stream().noneMatch(p -> "fields".equals(p.getName()))) return;
            operation.getResponses().forEach((status, response) -> {
                if (!status.startsWith("2") || response.getContent() == null) return;
                response.getContent().forEach((media, body) -> {
                    if (!(media.equals("*/*") || media.equals("application/json") || media.endsWith("+json"))
                            || body.getSchema() == null) return;
                    var full = body.getSchema();
                    var partial = partialSchema(full, api.getComponents().getSchemas(), mappers);
                    body.setSchema(new io.swagger.v3.oas.models.media.ComposedSchema()
                            .description(
                                    "Full response when fields is absent; selected fields may be omitted when fields is supplied.")
                            .addAnyOfItem(full)
                            .addAnyOfItem(partial));
                });
            });
        });
    }

    @SuppressWarnings({"rawtypes", "unchecked"})
    private io.swagger.v3.oas.models.media.Schema partialSchema(
            io.swagger.v3.oas.models.media.Schema source,
            java.util.Map<String, io.swagger.v3.oas.models.media.Schema> schemas,
            ObjectMapperProvider mappers) {
        if (source.get$ref() != null) {
            String original = source.get$ref().substring(source.get$ref().lastIndexOf('/') + 1);
            String name = "Partial" + original;
            if (!schemas.containsKey(name)) {
                schemas.put(name, new io.swagger.v3.oas.models.media.Schema<>());
                schemas.put(name, partialSchema(schemas.get(original), schemas, mappers));
            }
            return new io.swagger.v3.oas.models.media.Schema<>().$ref("#/components/schemas/" + name);
        }
        // Use Swagger's Schema deserializer, which preserves typed additionalProperties maps.
        var result = mappers.jsonMapper().convertValue(source, io.swagger.v3.oas.models.media.Schema.class);
        result.setRequired(null);
        if (source.getProperties() != null) {
            var properties = new java.util.LinkedHashMap<String, io.swagger.v3.oas.models.media.Schema>();
            source.getProperties()
                    .forEach((name, value) -> properties.put(
                            (String) name,
                            partialSchema((io.swagger.v3.oas.models.media.Schema) value, schemas, mappers)));
            result.setProperties(properties);
        }
        if (source.getItems() != null) result.setItems(partialSchema(source.getItems(), schemas, mappers));
        return result;
    }

    /** Swagger's nullable type union must also admit null in its closed enum. */
    @SuppressWarnings("unchecked") // Swagger properties expose raw child schemas.
    private static <T> void nullableEnums(io.swagger.v3.oas.models.media.Schema<T> schema) {
        if (schema.get$ref() != null
                && schema.getTypes() != null
                && schema.getTypes().contains("null")) {
            String reference = schema.get$ref();
            schema.set$ref(null);
            schema.setTypes(null);
            var nullable = new io.swagger.v3.oas.models.media.JsonSchema();
            nullable.setTypes(java.util.Set.of("null"));
            schema.setAnyOf(java.util.List.of(new io.swagger.v3.oas.models.media.Schema<>().$ref(reference), nullable));
        }
        if (schema.getTypes() != null
                && schema.getTypes().contains("null")
                && schema.getEnum() != null
                && !schema.getEnum().contains(null)) {
            var values = new java.util.ArrayList<T>(schema.getEnum());
            values.add(null);
            schema.setEnum(values);
        }
        if (schema.getProperties() != null)
            schema.getProperties().values().forEach(OpenApiConfiguration::nullableEnums);
        if (schema.getItems() != null) nullableEnums(schema.getItems());
    }

    @Bean
    OpenAPI spaceOpenApi(ObjectMapperProvider mappers) {
        // JSON Schema 的 type 可以是单个字符串或数组；克隆 JsonSchema 时两种形态都要保留。
        mappers.jsonMapper().enable(com.fasterxml.jackson.databind.DeserializationFeature.ACCEPT_SINGLE_VALUE_AS_ARRAY);
        // Java record 是 problem schema 的唯一声明点，避免手写契约与运行时载荷漂移。
        var problemSchemas = ModelConverters.getInstance(true).readAll(ApiProblem.class);

        return new OpenAPI()
                .servers(java.util.List.of(new io.swagger.v3.oas.models.servers.Server().url("/")))
                .info(new Info()
                        .title("Edition API")
                        .version("1.0.0")
                        .description("Five-plane API contract for Edition."))
                .components(
                        new Components()
                                .schemas(problemSchemas)
                                .addSecuritySchemes(
                                        "bearerAuth",
                                        new SecurityScheme()
                                                .type(SecurityScheme.Type.HTTP)
                                                .scheme("bearer")
                                                .bearerFormat("JWT | spc_ space token | spm_ management PAT")
                                                .description(
                                                        "Bearer authentication; management API requests do not require cookies. Browser refresh uses its separate cookie protocol.")));
    }
}
