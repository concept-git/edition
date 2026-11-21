package io.edition.cli.execution;

import static io.edition.cli.shared.JsonSupport.*;

import com.fasterxml.jackson.databind.*;
import com.fasterxml.jackson.databind.node.*;
import io.edition.cli.shared.CliFailure;
import java.nio.file.*;
import java.util.*;

/** 输出层：成功数据保留 API 结构，错误使用稳定 JSON；诊断写 stderr，秘密默认脱敏。 */
final class CallOutput {
    private final ControlCall context;

    CallOutput(ControlCall context) {
        this.context = context;
    }

    /** CLI、批量、MCP 在调用边界共用此分类；不把异常原文中的输入或服务端内容带到输出。 */
    int fail(Exception failure) {
        if (failure instanceof CliFailure known) return fail(known);
        if (failure instanceof InterruptedException) {
            Thread.currentThread().interrupt();
            return fail(new CliFailure(
                    "interrupted", "Waiting stopped; submitted work was not cancelled.", 130, context.resumeHint()));
        }
        if (failure instanceof javax.net.ssl.SSLException)
            return fail(CliFailure.error(
                    "tls_failed",
                    "TLS verification failed.",
                    "Check the configured origin and CA; certificate checks cannot be disabled."));
        if (failure instanceof java.net.http.HttpTimeoutException)
            return fail(CliFailure.error(
                    "request_timeout", "Request timed out; a write outcome may be unknown.", context.resumeHint()));
        if (failure instanceof java.io.IOException)
            return fail(
                    CliFailure.error("io_failed", "I/O failed; a write outcome may be unknown.", context.resumeHint()));
        return fail(new CliFailure("local_failure", "Local execution failed.", 5, context.resumeHint()));
    }

    int fail(CliFailure failure) {
        if (failure.httpStatus > 0) context.httpStatus = failure.httpStatus;
        int exit = failure.exit;
        var result = JSON.createObjectNode();
        var error = result.putObject("error")
                .put("code", failure.httpStatus > 0 ? failure.httpStatus : exit == 2 ? 401 : exit == 3 ? 400 : 500)
                .put("message", failure.getMessage())
                .put("reason", failure.code)
                .put("hint", failure.hint);
        if (failure.traceId != null) error.put("traceId", failure.traceId);
        if (failure.retryAfter != null) error.put("retryAfter", failure.retryAfter);
        if (!failure.violations.isEmpty()) error.set("violations", JSON.valueToTree(failure.violations));
        if (failure.violationsTruncated) error.put("violationsTruncated", true);
        if (context.state != null) result.put("state", context.state);
        context.result = result;
        (context.command.equals("mcp") ? context.error : context.output).println(result);
        context.error.println(failure.getMessage());
        return exit;
    }

    ObjectNode envelope(JsonNode data, String state) {
        var node = JSON.createObjectNode()
                .put("schemaVersion", "1")
                .put("ok", true)
                .put("command", context.command)
                .put("state", state)
                .put("durationMs", (System.nanoTime() - context.started) / 1_000_000);
        node.set("data", data);
        if (context.invocationId != null) node.put("invocationId", context.invocationId);
        return node;
    }

    private static JsonNode redact(JsonNode data) {
        var node = data.deepCopy();
        if (node.isObject()) {
            var names = new ArrayList<String>();
            node.fieldNames().forEachRemaining(names::add);
            for (String n : names)
                if (secretField(n, node.get(n))) ((ObjectNode) node).put(n, "REDACTED");
                else ((ObjectNode) node).set(n, redact(node.get(n)));
        } else if (node.isArray()) for (int i = 0; i < node.size(); i++) ((ArrayNode) node).set(i, redact(node.get(i)));
        return node;
    }

    void print(JsonNode receipt) throws Exception {
        context.httpStatus = receipt.path("httpStatus").asInt();
        context.state = receipt.path("state").asText();
        context.replayed = receipt.path("replayed").asBoolean();
        if (context.replayed)
            context.error.println(
                    "Replayed historical receipt; query current facts before claiming the resource state.");
        if (receipt.path("httpStatus").asInt() == 202)
            context.error.println("Accepted; background work is not yet verified complete.");
        if (context.invocationId != null) context.error.println("Receipt: " + context.invocationId);
        if (context.flag("inspect")) {
            var observed = JSON.createObjectNode()
                    .put("status", receipt.path("httpStatus").asInt());
            observed.set("body", receipt.path("data"));
            observed.set("headers", receipt.path("headers"));
            nativePrint(observed);
        } else nativePrint(receipt.path("data"));
    }
    /** 只格式化 API 数据，不加入私密回执的内部字段。预演即使要求显示秘密也必须脱敏。 */
    void nativePrint(JsonNode data) throws Exception {
        // 契约可能遗漏或滞后；已识别的秘密字段仍默认脱敏，不能只依赖 secretOutput 标记。
        if (!context.flag("reveal-secret") || context.flag("dry-run")) data = redact(data);
        context.result = data;
        String format = context.opt("format", "json");
        if (format.equals("yaml")) {
            context.output.print(new com.fasterxml.jackson.dataformat.yaml.YAMLMapper().writeValueAsString(data));
        } else if (format.equals("csv") || format.equals("table")) {
            JsonNode rows = data.isArray()
                    ? data
                    : data.path("items").isArray()
                            ? data.path("items")
                            : JSON.createArrayNode().add(data);
            var keys = new LinkedHashSet<String>();
            rows.forEach(row -> row.fieldNames().forEachRemaining(keys::add));
            if (keys.isEmpty()) keys.add("value");
            String delimiter = format.equals("csv") ? "," : "\t";
            context.output.println(
                    String.join(delimiter, keys.stream().map(CallOutput::cell).toList()));
            for (var row : rows) {
                var values = new ArrayList<String>();
                for (String key : keys) {
                    JsonNode value = row.isObject() ? row.path(key) : row;
                    values.add(
                            cell(value.isMissingNode() ? "" : value.isTextual() ? value.asText() : value.toString()));
                }
                context.output.println(String.join(delimiter, values));
            }
        } else context.output.println(JSON.writeValueAsString(data));
        if (context.output.checkError())
            throw new CliFailure(
                    "broken_pipe", "Output pipe closed; background work was not cancelled.", 130, context.resumeHint());
    }

    private static String cell(String text) {
        return "\""
                + text.replace("\"", "\"\"")
                        .replace("\r", "\\r")
                        .replace("\n", "\\n")
                        .replace("\t", "\\t") + "\"";
    }
}
