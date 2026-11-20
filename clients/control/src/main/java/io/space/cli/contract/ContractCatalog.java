package io.space.cli.contract;

import static io.space.cli.shared.JsonSupport.JSON;

import com.fasterxml.jackson.databind.*;
import com.fasterxml.jackson.databind.node.ObjectNode;
import io.space.cli.shared.CliFailure;
import java.io.*;
import java.util.*;

/** 发行物内的契约目录：启动只读索引，查询到方法/类型时才加载对应文件并缓存。 */
public final class ContractCatalog {
    public final JsonNode index;
    private final Map<String, JsonNode> cache = new java.util.concurrent.ConcurrentHashMap<>();

    public ContractCatalog() throws IOException {
        index = read("index.json");
    }

    public JsonNode read(String name) throws IOException {
        if (!name.matches("[a-zA-Z0-9_./-]+\\.json") || name.contains(".."))
            throw new IOException("Invalid contract reference");
        var previous = cache.get(name);
        if (previous != null) return previous;
        try (var stream = ContractCatalog.class.getResourceAsStream("/contract/" + name)) {
            if (stream == null) throw new IOException("Missing compiled contract");
            var value = JSON.readTree(stream);
            cache.put(name, value);
            return value;
        }
    }

    public JsonNode operation(String name) {
        var descriptor = index.path("commands").get(name);
        if (descriptor == null) return null;
        try {
            return read(descriptor.path("ref").asText());
        } catch (IOException e) {
            throw new UncheckedIOException(e);
        }
    }

    /** 示例由契约中的类型样例生成，末尾固定为预演，复制执行不会发送业务写请求。 */
    public static String example(JsonNode operation) {
        var sample = operation.path("example");
        var result = new StringBuilder(
                "spacectl " + operation.path("apiCommand").asText().replace('.', ' '));
        if (!sample.path("params").isEmpty())
            result.append(" --params ")
                    .append(
                            sample.path("privateParams").asBoolean()
                                    ? "@private-params.json"
                                    : quote(sample.path("params").toString()));
        if (sample.has("json"))
            result.append(" --json ")
                    .append(
                            sample.path("privateBody").asBoolean()
                                    ? "@private-body.json"
                                    : quote(sample.path("json").toString()));
        else if (operation.path("capabilities").path("binaryInput").asBoolean()) result.append(" --upload upload.bin");
        return result.append(" --dry-run").toString();
    }

    private static String quote(String value) {
        return "'" + value.replace("'", "'\"'\"'") + "'";
    }

    public JsonNode byWire(String id) {
        return operation(index.path("operationIds").path(id).asText());
    }

    public JsonNode schema(String ref) {
        if (!ref.startsWith("#/components/schemas/"))
            throw CliFailure.input("Unsupported schema reference.", "Rebuild the contract catalog.");
        try {
            return read("schemas/" + ref.substring("#/components/schemas/".length()) + ".json");
        } catch (IOException e) {
            throw new UncheckedIOException(e);
        }
    }

    public ObjectNode schemaDocument(JsonNode source) {
        // 收集当前类型实际引用的定义。已收集的类型不重复入队，循环引用不会无限展开。
        ObjectNode document = source.deepCopy();
        var schemas = JSON.createObjectNode();
        var pending = new ArrayDeque<JsonNode>();
        pending.add(source);
        while (!pending.isEmpty()) {
            var node = pending.removeFirst();
            if (node.has("$ref")) {
                String ref = node.path("$ref").asText(), name = ref.substring(ref.lastIndexOf('/') + 1);
                if (!schemas.has(name)) {
                    var definition = schema(ref);
                    schemas.set(name, definition.deepCopy());
                    pending.add(definition);
                }
            }
            if (node.isContainerNode()) node.elements().forEachRemaining(pending::add);
        }
        document.putObject("components").set("schemas", schemas);
        return document;
    }

    public JsonNode resolve(JsonNode schema) {
        return schema.has("$ref") ? schema(schema.path("$ref").asText()) : schema;
    }

    public JsonNode bodySchema(JsonNode method) {
        JsonNode source = resolve(method.path("requestBody")
                .path("content")
                .path("application/json")
                .path("schema"));
        if (method.path("cliRequiredBodyFields").isEmpty()) return source;
        var schema = (ObjectNode) source.deepCopy();
        var required = schema.withArray("required");
        for (var field : method.path("cliRequiredBodyFields")) {
            boolean present = false;
            for (var existing : required) if (existing.equals(field)) present = true;
            if (!present) required.add(field);
            // HTTP may retain nullable legacy input; every new CLI surface uses an explicit value.
            // Keep the authoritative type/enum intact and intersect only the CLI's non-null rule.
            var property = schema.path("properties").path(field.asText()).deepCopy();
            var constrained = JSON.createObjectNode();
            constrained
                    .putArray("allOf")
                    .add(property)
                    .addObject()
                    .putObject("not")
                    .put("type", "null");
            ((ObjectNode) schema.path("properties")).set(field.asText(), constrained);
        }
        return schema;
    }

    public List<JsonNode> allOperations() {
        var result = new ArrayList<JsonNode>();
        index.path("commands").fieldNames().forEachRemaining(name -> result.add(operation(name)));
        return result;
    }

    public Set<String> loadedFiles() {
        return Set.copyOf(cache.keySet());
    }
}
