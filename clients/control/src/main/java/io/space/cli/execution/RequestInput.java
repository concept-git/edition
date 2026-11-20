package io.space.cli.execution;

import static io.space.cli.shared.HttpClients.encode;
import static io.space.cli.shared.JsonSupport.*;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.*;
import com.networknt.schema.*;
import io.space.cli.shared.CliFailure;
import java.io.*;
import java.nio.charset.StandardCharsets;
import java.nio.file.*;
import java.util.*;

/** 把 flags、文件或 stdin 转成执行器使用的 JSON 请求。先按字段用途校验，再构建 URL/正文。 */
final class RequestInput {
    private final ControlCall context;

    RequestInput(ControlCall context) {
        this.context = context;
    }

    ObjectNode read(String flag) throws Exception {
        String source = context.opt(flag, "{}");
        if (source.equals("-")) {
            if (context.stdinUsed) throw failure("Only one input may consume stdin.");
            context.stdinUsed = true;
        }
        String text = source.startsWith("@")
                ? readText(file(source.substring(1), false).toString())
                : source.equals("-") ? readText("-") : source;
        if (text.length() > 16 * 1024 * 1024) throw failure("JSON input exceeds 16 MiB.");
        JsonNode value;
        try {
            value = JSON.readTree(text);
        } catch (com.fasterxml.jackson.core.JsonProcessingException failure) {
            throw failure("Input JSON is invalid; reject duplicate keys and trailing data.");
        }
        if (!(value instanceof ObjectNode object)) throw failure("JSON input must be an object.");
        return object;
    }

    ObjectNode request(JsonNode op) throws Exception {
        if (context.options.containsKey("invocation-id"))
            io.space.cli.state.InvocationJournal.validateId(context.required("invocation-id"));
        if (context.opt("params", "").equals("-") && context.opt("json", "").equals("-"))
            throw failure("Only one input may consume stdin.");
        ObjectNode params = read("params"), body = read("json");
        if (op.path("operationId").asText().equals("listPages")
                && params.has("ids")
                && (params.has("cursor") || params.has("limit")))
            throw failure(
                    "Page IDs cannot be combined with cursor or explicit limit; use batchGet for a bounded ID set.");
        var declared = new HashSet<String>();
        var headers = JSON.createObjectNode();
        var query = new ArrayList<String>();
        String path = op.path("path").asText();
        for (var p : op.path("parameters")) {
            String name = p.path("name").asText(), role = p.path("in").asText();
            declared.add(name);
            if (!params.has(name)) {
                if (p.path("required").asBoolean() && !name.equals("Idempotency-Key"))
                    throw failure("Missing required API parameter: " + name);
                continue;
            }
            JsonNode value = params.get(name);
            validate(
                    p.has("schema") ? p.path("schema") : JSON.createObjectNode().put("type", "string"),
                    value,
                    "parameter " + name);
            String text = value.isTextual() ? value.asText() : value.toString();
            if (name.equals("fields")) ResponseFields.validate(context.catalog, op, text, context.flag("page-all"));
            if (text.codePoints().anyMatch(c -> c < 32 || c == 127))
                throw failure("Control characters are invalid in API parameters.");
            if (secretField(name, value) && inline("params"))
                throw failure("Secret parameters require @FILE or stdin.");
            if (role.equals("path")) {
                if (text.matches(".*[/?#%\\\\].*") || Set.of(".", "..").contains(text))
                    throw failure("Invalid resource path segment.");
                path = path.replace("{" + name + "}", encode(text));
            } else if (role.equals("query")) {
                if (value.isArray()) {
                    if (!p.path("style").asText("form").equals("form"))
                        throw failure("Unsupported query array serialization style.");
                    var values = new ArrayList<String>();
                    for (var item : value) {
                        if (item.isContainerNode()
                                || item.isNull()
                                || item.asText().codePoints().anyMatch(c -> c < 32 || c == 127))
                            throw failure("Query arrays require valid scalar elements without control characters.");
                        values.add(item.asText());
                    }
                    if (p.path("explode").asBoolean(true)) {
                        for (String item : values) query.add(encode(name) + "=" + encode(item));
                    } else query.add(encode(name) + "=" + encode(String.join(",", values)));
                } else query.add(encode(name) + "=" + encode(text));
            } else if (role.equals("header")) {
                if (Set.of("authorization", "cookie", "host").contains(name.toLowerCase(Locale.ROOT)))
                    throw failure("Credential and origin headers cannot be supplied.");
                if (name.equals("Idempotency-Key")) {
                    if (!text.matches("[a-zA-Z0-9._:-]{1,128}")) throw failure("Invalid idempotency key.");
                    context.options.put("idempotency-key", text);
                    continue;
                }
                if (name.equals("If-Match") && !text.matches("\"[^\"\\r\\n]+\""))
                    throw failure("A strong quoted ETag is required.");
                headers.put(name, text);
            }
        }
        for (var names = params.fieldNames(); names.hasNext(); )
            if (!declared.contains(names.next())) throw failure("Unknown API parameter.");
        if (inline("json") && hasSecret(context.catalog.bodySchema(op), body, 0))
            throw failure("Secret body fields require @FILE or stdin.");
        if (!query.isEmpty()) path += "?" + String.join("&", query);
        var request = JSON.createObjectNode()
                .put("method", op.path("method").asText())
                .put("path", path)
                .put("operationId", op.path("operationId").asText());
        request.set("headers", headers);
        if (context.options.containsKey("upload")) {
            if (context.options.containsKey("json")) throw failure("Choose JSON body or upload.");
            Path file = file(context.required("upload"), false);
            var content = op.path("requestBody").path("content");
            String mime = context.opt(
                    "upload-content-type",
                    content.has("application/zip")
                            ? "application/zip"
                            : content.has("multipart/form-data") ? "multipart/form-data" : "application/octet-stream");
            if (!content.has(mime)) throw failure("Undeclared upload content type.");
            request.put("file", file.toString()).put("fileSha256", hashFile(file));
            if (mime.equals("multipart/form-data")) {
                String filename = file.getFileName().toString();
                if (filename.codePoints().anyMatch(c -> c < 32 || c == 127))
                    throw failure("Upload filename contains control characters.");
                request.put("filename", filename); // 文件名也是 HTTP 请求的一部分，重放时必须保持原值。
                String boundary =
                        "spacectl-" + request.path("fileSha256").asText().substring(0, 24);
                request.put("boundary", boundary);
                mime += "; boundary=" + boundary;
            }
            request.put("contentType", mime);
        } else if (context.options.containsKey("json")) {
            JsonNode schema = context.catalog.bodySchema(op);
            if (schema.isMissingNode() || schema.isEmpty()) throw failure("This method has no JSON body.");
            validate(schema, body, "body");
            request.put("body", JSON.writeValueAsString(canonical(body))).put("contentType", "application/json");
        } else if (op.path("requestBody").path("required").asBoolean())
            throw failure("Missing request body or upload.");
        if (context.options.containsKey("output")) {
            if (Set.of("json", "jsonl", "yaml", "table", "csv").contains(context.required("output")))
                throw failure("--output now names a binary file; use --format json for JSON output.");
            Path destination = file(context.required("output"), true);
            context.options.put("output", destination.toString());
        }
        context.integer("timeout", 30, 1, 300);
        if (context.flag("new-invocation") && context.options.containsKey("invocation-id"))
            throw failure("Choose a stable invocation ID or a new invocation, not both.");
        if (context.options.containsKey("upload-content-type") && !context.options.containsKey("upload"))
            throw failure("--upload-content-type requires --upload.");
        if (!context.flag("page-all")
                && (context.options.containsKey("page-limit") || context.options.containsKey("page-delay")))
            throw failure("Pagination controls require --page-all.");
        if (context.flag("page-all")) {
            context.integer("page-limit", 10, 1, 10000);
            context.integer("page-delay", 100, 0, 60000);
            if (!context.opt("format", "json").equals("json"))
                throw failure("--page-all requires --format json (one page per NDJSON line).");
        }
        return request;
    }

    Path file(String value, boolean output) throws Exception {
        // 先固定允许的文件根，再逐层拒绝符号链接，避免路径校验后读到根外文件。
        Path source = Path.of(value),
                declaredRoot =
                        Path.of(context.opt("file-root", ".")).toAbsolutePath().normalize(),
                root = declaredRoot.toRealPath();
        for (Path part : source)
            if (part.toString().equals("..")) throw failure("Parent traversal is not allowed in file paths.");
        Path path = source.toAbsolutePath().normalize();
        if (path.startsWith(declaredRoot)) path = root.resolve(declaredRoot.relativize(path));
        if (!path.startsWith(root)) throw failure("File is outside --file-root.");
        for (Path cursor = path; !cursor.equals(root); cursor = cursor.getParent())
            if (Files.isSymbolicLink(cursor))
                throw failure("Symbolic links are not allowed inside the allowed file root.");
        if (output ? Files.exists(path, LinkOption.NOFOLLOW_LINKS) : !Files.isRegularFile(path))
            throw failure(output ? "Output already exists; choose a new destination." : "Input file is absent.");
        if (!Files.isDirectory(path.getParent())
                || !path.getParent().toRealPath().startsWith(root))
            throw failure("File parent is outside the allowed root or absent.");
        return path;
    }

    private boolean inline(String name) {
        String value = context.opt(name, "{}");
        return !context.flag("trusted-json-input") && !value.equals("-") && !value.startsWith("@");
    }

    boolean hasSecret(JsonNode schema, JsonNode value, int depth) {
        if (depth > 32) throw failure("Input nesting exceeds its limit.");
        schema = context.catalog.resolve(schema);
        if (schema.has("anyOf"))
            for (var variant : schema.path("anyOf")) if (hasSecret(variant, value, depth + 1)) return true;
        if (value.isObject())
            for (var field : value.properties()) {
                JsonNode child = schema.path("properties").path(field.getKey());
                if (child.isMissingNode()) child = schema.path("additionalProperties");
                if (secretField(field.getKey(), field.getValue()) || hasSecret(child, field.getValue(), depth + 1))
                    return true;
            }
        if (value.isArray()) for (var child : value) if (hasSecret(schema.path("items"), child, depth + 1)) return true;
        return false;
    }

    private CliFailure failure(String message) {
        String example = context.operation == null
                ? ""
                : io.space.cli.contract.ContractCatalog.example(context.operation) + "; ";
        return CliFailure.input(message, example + context.schemaHint() + "; spacectl " + context.command + " --help");
    }

    String readText(String source) throws Exception {
        if (!source.equals("-") && (!Files.isRegularFile(Path.of(source)) || !Files.isReadable(Path.of(source))))
            throw CliFailure.input(
                    "Input file is absent or unreadable.",
                    "Check its path/permissions; spacectl " + context.command + " --help.");
        try (var stream = source.equals("-")
                ? new FilterInputStream(context.input) {
                    @Override
                    public void close() {}
                }
                : Files.newInputStream(Path.of(source))) {
            byte[] bytes = stream.readNBytes(16 * 1024 * 1024 + 1);
            if (bytes.length > 16 * 1024 * 1024)
                throw CliFailure.input("JSON/text input exceeds 16 MiB.", "Use a binary upload or smaller request.");
            var decoder =
                    StandardCharsets.UTF_8.newDecoder().onMalformedInput(java.nio.charset.CodingErrorAction.REPORT);
            try {
                return decoder.decode(java.nio.ByteBuffer.wrap(bytes)).toString();
            } catch (java.nio.charset.CharacterCodingException failure) {
                throw failure("Input UTF-8 is invalid.");
            }
        }
    }

    void validate(JsonNode schema, JsonNode data, String where) {
        var full = context.catalog.schemaDocument(schema);
        emailPolicyOnServer(full);
        var cfg = SchemaRegistryConfig.builder().formatAssertionsEnabled(true).build();
        var validator = SchemaRegistry.withDefaultDialect(
                        com.networknt.schema.dialect.Dialects.getDraft202012(),
                        builder -> builder.schemaRegistryConfig(cfg))
                .getSchema(full);
        var violations = validator.validate(data);
        if (!violations.isEmpty()) {
            var failure = CliFailure.input(
                    "Invalid " + where + ".", "Correct error.violations fields; inspect " + context.schemaHint() + ".");
            failure.violations = violations.stream()
                    .limit(16)
                    .map(error -> new CliFailure.Violation(validationField(schema, error, where), error.getKeyword()))
                    .distinct()
                    .toList();
            failure.violationsTruncated = violations.size() > 16;
            throw failure;
        }
        strictObjects(schema, data, 0);
    }

    /** 字段路径只使用契约中的名称，动态键不进入错误输出。 */
    private String validationField(JsonNode schema, com.networknt.schema.Error error, String where) {
        StringBuilder field =
                new StringBuilder(where.startsWith("parameter ") ? "params." + where.substring(10) : where);
        var location = error.getInstanceLocation();
        for (int i = 0; i < Math.min(location.getNameCount(), 16); i++) {
            schema = context.catalog.resolve(schema);
            Object element = location.getElement(i);
            if (element instanceof Number number) {
                field.append('[').append(number.intValue()).append(']');
                schema = schema.path("items");
            } else {
                String name = element.toString();
                JsonNode child = schema.path("properties").path(name);
                field.append('.').append(child.isMissingNode() ? "*" : name);
                schema = child.isMissingNode() ? schema.path("additionalProperties") : child;
            }
        }
        schema = context.catalog.resolve(schema);
        if (error.getKeyword().equals("required")
                && error.getProperty() != null
                && schema.path("properties").has(error.getProperty()))
            field.append('.').append(error.getProperty());
        return field.toString();
    }

    private void strictObjects(JsonNode schema, JsonNode data, int depth) {
        if (depth > 64) throw CliFailure.input("Input nesting exceeds its limit.", "Use a smaller structured request.");
        schema = context.catalog.resolve(schema);
        if (data.isTextual()
                && data.asText().codePoints().anyMatch(c -> c < 32 && c != 9 && c != 10 && c != 13 || c == 127))
            throw CliFailure.input(
                    "Input contains unsupported control characters.",
                    "Text may contain tabs and line breaks; remove other control characters.");
        if (schema.has("anyOf")) {
            for (var variant : schema.path("anyOf"))
                if (context.catalog.resolve(variant).has("properties") && data.isObject()) {
                    strictObjects(variant, data, depth + 1);
                    return;
                }
        }
        if (data.isObject())
            for (var entry : data.properties()) {
                var child = schema.path("properties").path(entry.getKey());
                if (child.isMissingNode()) {
                    if (schema.has("properties")
                            && !schema.path("additionalProperties").asBoolean()
                            && !schema.path("additionalProperties").isObject())
                        throw CliFailure.input(
                                "Unknown JSON body field.",
                                "Use fields in " + context.schemaHint()
                                        + "; dynamic map keys are allowed where declared.");
                    child = schema.path("additionalProperties");
                }
                strictObjects(child, entry.getValue(), depth + 1);
            }
        if (data.isArray()) for (var child : data) strictObjects(schema.path("items"), child, depth + 1);
    }
    /** 平台允许私有邮件域；最终邮箱策略由服务端判断，避免通用格式库误拒绝合法输入。 */
    private static void emailPolicyOnServer(JsonNode schema) {
        if (schema instanceof ObjectNode object
                && schema.path("format").asText().equals("email")) object.remove("format");
        if (schema.isContainerNode()) schema.elements().forEachRemaining(RequestInput::emailPolicyOnServer);
    }
}
