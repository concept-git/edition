package io.edition.cli.execution;

import static io.edition.cli.shared.JsonSupport.*;

import com.fasterxml.jackson.databind.*;
import com.fasterxml.jackson.databind.node.*;
import com.networknt.schema.*;
import io.edition.cli.shared.CliFailure;
import io.edition.cli.shared.PrivateFiles;
import java.nio.file.*;
import java.util.*;

/** 在请求期限内读取响应，保留已观察的状态；校验远端数据并生成回执，不决定写入是否可重放。 */
final class ResponseReader {
    private final ControlCall context;
    private final CallOutput results;

    ResponseReader(ControlCall context, CallOutput results) {
        this.context = context;
        this.results = results;
    }

    /** 错误动作由本地契约决定，不回显可能包含秘密的远端 detail。 */
    private String rejectionHint(String code) {
        return switch (code) {
            case "management_scope_required" ->
                "This method requires management PAT scope(s): "
                        + context.operation.path("requiredScopes")
                        + ". Select a designated profile with these scopes and current resource permissions. "
                        + context.schemaHint();
            case "cross_site_request_rejected" ->
                "Use a Session profile with --auth-origin matching the allowed console origin. " + context.schemaHint();
            case "import_source_unreachable" ->
                "The server could not fetch the source ZIP; the cause is unconfirmed. Check anonymous HTTPS access "
                        + "from the server, or upload an authorized local ZIP with --upload. " + context.schemaHint();
            default ->
                "Inspect the command schema and current resource; use a new intent after correcting the request.";
        };
    }

    ObjectNode read(ControlTransport transport, JsonNode request, String key) throws Exception {
        long started = System.nanoTime();
        context.state = context.operation.path("mutates").asBoolean() ? "unknown" : null;
        var response = transport.send(request, key);
        context.httpStatus = response.statusCode();
        var remaining = transport.timeout.minusNanos(System.nanoTime() - started);
        if (remaining.isNegative() || remaining.isZero()) {
            response.body().close();
            throw new java.net.http.HttpTimeoutException("Request deadline expired.");
        }
        return io.edition.cli.shared.HttpClients.readBody(response.body(), remaining, body -> {
            int status = response.statusCode();
            String content = response.headers().firstValue("content-type").orElse("");
            if (status >= 400) {
                String code = "http_" + status;
                JsonNode problem = JSON.createObjectNode();
                try {
                    problem = JSON.readTree(body.readNBytes(65537));
                } catch (Exception ignored) {
                    /* 即使错误正文损坏，HTTP 状态仍然有效。 */
                }
                if (problem == null) problem = JSON.createObjectNode();
                var allowed = context.catalog
                        .schema("#/components/schemas/ProblemCode")
                        .path("enum");
                for (var value : allowed) if (value.equals(problem.path("code"))) code = value.asText();
                // 只透出契约中的错误码和受限 traceId，服务端错误原文可能含秘密。
                // A timeout, throttle or transient response does not confirm rejection of a write.
                boolean pending = status == 408
                        || status == 429
                        || status >= 500
                        || (status == 409 && code.equals("idempotency_request_in_progress"));
                if (context.operation.path("mutates").asBoolean()) context.state = pending ? "unknown" : "rejected";
                var failure = CliFailure.error(
                        code,
                        pending
                                ? "Request outcome is unconfirmed (HTTP " + status + ")."
                                : "Control rejected the request (HTTP " + status + ").",
                        pending
                                ? "Preserve the original request and key. " + context.resumeHint()
                                : rejectionHint(code));
                failure.httpStatus = status;
                failure.retryAfter =
                        retryAfter(response.headers().firstValue("retry-after").orElse(""));
                violations(problem.path("violations"), failure);
                String trace = problem.path("traceId").asText();
                if (trace.matches("[a-fA-F0-9]{16,32}|[a-fA-F0-9]{8}(?:-[a-fA-F0-9]{4}){3}-[a-fA-F0-9]{12}"))
                    failure.traceId = trace;
                throw failure;
            }
            JsonNode data;
            if (status == 204) data = NullNode.instance;
            else if (content.contains("json") || content.isEmpty()) {
                byte[] bytes = body.readNBytes(16 * 1024 * 1024 + 1);
                if (bytes.length > 16 * 1024 * 1024)
                    throw CliFailure.error(
                            "response_too_large",
                            "JSON response exceeds 16 MiB.",
                            "Use pagination or binary download.");
                try {
                    data = bytes.length == 0 ? NullNode.instance : JSON.readTree(bytes);
                } catch (com.fasterxml.jackson.core.JsonProcessingException failure) {
                    throw CliFailure.error(
                            "response_invalid_json",
                            "Control returned invalid JSON.",
                            "Check the service response and contract version. " + context.resumeHint());
                }
                if (data == null || data.isMissingNode())
                    throw CliFailure.error(
                            "response_invalid_json",
                            "Control returned invalid JSON.",
                            "Check the service response and contract version. " + context.resumeHint());
            } else {
                if (!context.options.containsKey("output"))
                    throw CliFailure.input(
                            "Binary response needs an output destination.", "Repeat this read with --output FILE.");
                String destination = context.required("output");
                Path target = new RequestInput(context).file(destination, true);
                Path temporary = Files.createTempFile(target.getParent(), ".download-", ".tmp");
                long bytes;
                try {
                    PrivateFiles.privateMode(temporary, false);
                    try (var output = Files.newOutputStream(temporary)) {
                        bytes = body.transferTo(output);
                    }
                    new RequestInput(context).file(destination, true);
                    Files.createLink(target, temporary); // 原子发布下载文件；目标已存在时失败，绝不覆盖。
                } finally {
                    Files.deleteIfExists(temporary);
                }
                data = JSON.createObjectNode()
                        .put("status", "success")
                        .put("saved_file", destination)
                        .put("mimeType", content)
                        .put("bytes", bytes);
            }
            String operationId = request.path("operationId").asText();
            // 对认证和编辑闭环严格核验响应；其他接口保持原生 API 数据。
            if (Set.of(
                            "authenticationContext",
                            "issueManagementToken",
                            "listManagementTokens",
                            "createPage",
                            "viewPage",
                            "editPage",
                            "planSpaceTermination",
                            "planSiteTermination")
                    .contains(operationId)) {
                JsonNode operation = context.catalog.byWire(operationId);
                JsonNode contentSchema = operation
                        .path("responses")
                        .path("" + status)
                        .path("content")
                        .path("application/json")
                        .path("schema");
                if (!contentSchema.isMissingNode()) {
                    var full = context.catalog.schemaDocument(contentSchema);
                    var checks = SchemaRegistry.withDefaultDialect(
                                    com.networknt.schema.dialect.Dialects.getDraft202012())
                            .getSchema(full)
                            .validate(data);
                    if (!checks.isEmpty())
                        throw CliFailure.error(
                                "response_contract_mismatch",
                                "Control response violates the bundled schema at "
                                        + checks.iterator().next().getInstanceLocation() + ": "
                                        + checks.iterator().next().getKeyword() + ".",
                                "Inspect contract versions; a keyed write can be resumed with the same invocation after correcting the contract.");
                }
            }
            var result = results.envelope(data, status == 202 ? "accepted" : "completed");
            result.put("httpStatus", status);
            var headers = result.putObject("headers");
            for (String h : List.of("etag", "location", "retry-after", "x-request-id"))
                response.headers().firstValue(h).ifPresent(v -> headers.put(h, v));
            return result;
        });
    }

    /** 只保留协议定义的秒数或 HTTP 日期；不让任意响应头进入诊断输出。 */
    private static String retryAfter(String value) {
        String text = value.strip();
        if (text.matches("[0-9]{1,10}")) return text;
        if (text.length() > 64) return null;
        try {
            return java.time.format.DateTimeFormatter.RFC_1123_DATE_TIME.format(
                    java.time.ZonedDateTime.parse(text, java.time.format.DateTimeFormatter.RFC_1123_DATE_TIME));
        } catch (java.time.DateTimeException invalid) {
            return null;
        }
    }

    private static final Set<String> VIOLATION_CODES = Set.of(
            "required",
            "size",
            "size_out_of_range",
            "too_small",
            "too_large",
            "invalid",
            "invalid_format",
            "invalid_email",
            "invalid_url",
            "https_required",
            "exactly_one",
            "unsupported_value",
            "invalid_field_mask",
            "not_mounted",
            "not_permutation",
            "invalid_member_role",
            "invalid_token_scope",
            "invalid_token_expiry",
            "invalid_token_role",
            "must_differ_from_source");

    /** 字段来自输入契约，错误码来自有限词表；动态 map 的不可信键和原始错误值均不回显。 */
    private void violations(JsonNode supplied, CliFailure failure) {
        if (!supplied.isArray()) return;
        var safe = new ArrayList<CliFailure.Violation>();
        for (int i = 0; i < Math.min(supplied.size(), 64); i++) {
            var item = supplied.get(i);
            String field = item.path("field").asText("");
            if (!declaredField(field)) {
                failure.violationsTruncated = true;
                continue;
            }
            String code = item.path("code").asText("");
            safe.add(new CliFailure.Violation(field, VIOLATION_CODES.contains(code) ? code : "invalid"));
        }
        failure.violations = List.copyOf(safe);
        failure.violationsTruncated |= supplied.size() > 64;
    }

    private boolean declaredField(String field) {
        if (field.length() > 200 || !field.matches("[A-Za-z][A-Za-z0-9_.\\[\\]|-]*")) return false;
        // 少数跨字段约束使用 uploadKey|url；每一段都必须由当前输入契约声明。
        for (String path : field.split("\\|", -1)) {
            boolean parameter = false;
            for (var p : context.operation.path("parameters"))
                if (p.path("name").asText().equals(path)) parameter = true;
            if (parameter) continue;
            if (path.equals("zip")
                    && context.operation
                            .path("capabilities")
                            .path("binaryInput")
                            .asBoolean()) continue;
            if (!declaredPath(context.catalog.bodySchema(context.operation), path.split("\\.", -1), 0)) return false;
        }
        return true;
    }

    private boolean declaredPath(JsonNode schema, String[] parts, int position) {
        if (position >= parts.length || position >= 16) return false;
        schema = context.catalog.resolve(schema);
        if (schema.has("anyOf")) {
            for (var branch : schema.path("anyOf")) if (declaredPath(branch, parts, position)) return true;
            return false;
        }
        String part = parts[position];
        if (!part.matches("[A-Za-z][A-Za-z0-9_-]*(?:\\[[0-9]{1,6}\\])?")) return false;
        String name = part.replaceFirst("\\[.*", "");
        JsonNode child = schema.path("properties").path(name);
        if (child.isMissingNode()) return false;
        if (part.contains("[")) {
            child = context.catalog.resolve(child).path("items");
            if (child.isMissingNode()) return false;
        }
        return position + 1 == parts.length || declaredPath(child, parts, position + 1);
    }
}
