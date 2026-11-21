package io.edition.cli.execution;

import static io.edition.cli.shared.HttpClients.encode;
import static io.edition.cli.shared.JsonSupport.*;

import com.fasterxml.jackson.databind.*;
import com.fasterxml.jackson.databind.node.*;
import io.edition.cli.shared.CliFailure;
import io.edition.cli.state.InvocationJournal;
import io.edition.cli.state.ProfileStore;
import java.net.*;
import java.time.*;
import java.util.*;

/** 共用调用流程：校验 → 预演或确认 → 认证 → 保存原意图 → HTTP → 保存结果。 */
final class ControlOperations {
    private final ControlCall context;
    private final CallOutput results;
    private final ResponseReader responses;

    ControlOperations(ControlCall context, CallOutput results) {
        this.context = context;
        this.results = results;
        responses = new ResponseReader(context, results);
    }

    ObjectNode prepare(JsonNode op) throws Exception {
        context.operation = op;
        if (!Set.of("json", "yaml", "table", "csv").contains(context.opt("format", "json")))
            throw CliFailure.input("Unknown output format.", "Use --format json, yaml, table, or csv.");
        var request = new RequestInput(context).request(op);
        ReadWait.validate(context, op);
        if (!context.flag("dry-run") && op.path("highImpact").asBoolean() && !context.flag("yes"))
            throw CliFailure.input(
                    "High-impact operation needs explicit confirmation.",
                    "Inspect --dry-run, then use --yes for the agreed target and effect.");
        return request;
    }

    void invoke(JsonNode op, ObjectNode request) throws Exception {
        context.operation = op;
        // 预演必须先于凭据、意图和组合层提供的后台动作。
        if (context.flag("dry-run")) results.nativePrint(plan(op, request));
        else {
            context.beforeExecution.run();
            execute(op, request);
        }
    }

    private ObjectNode plan(JsonNode op, ObjectNode request) throws Exception {
        String[] parts = request.path("path").asText().split("\\?", 2);
        var preview = JSON.createObjectNode()
                .put("dry_run", true)
                .put("url", parts[0])
                .put("method", request.path("method").asText());
        var query = preview.putObject("query_params");
        if (parts.length > 1)
            for (String field : parts[1].split("&")) {
                String[] pair = field.split("=", 2);
                String name = URLDecoder.decode(pair[0], java.nio.charset.StandardCharsets.UTF_8);
                String value = URLDecoder.decode(pair[1], java.nio.charset.StandardCharsets.UTF_8);
                var previous = query.get(name);
                if (previous == null) query.put(name, value);
                else if (previous.isArray()) ((ArrayNode) previous).add(value);
                else query.putArray(name).add(previous).add(value);
            }
        preview.set(
                "body", request.has("body") ? JSON.readTree(request.path("body").asText()) : JSON.nullNode());
        preview.put("is_multipart_upload", request.path("contentType").asText().startsWith("multipart/form-data"));
        var origin = ProfileStore.configuredOrigin(context.opt("profile", "default"));
        preview.put("originConfigured", origin != null);
        if (origin != null) preview.put("url", origin.resolve(parts[0]).toString());
        // 带秘密的路径只显示模板；正文和查询参数由输出层统一脱敏。
        for (var parameter : op.path("parameters"))
            if (secretField(parameter.path("name").asText(), JSON.nullNode()))
                preview.put("url", op.path("path").asText());
        return preview;
    }

    private void requireCredential(JsonNode operation, JsonNode profile) {
        String type = profile.path("credentialType").asText();
        for (var accepted : operation.path("credentialTypes"))
            if (accepted.asText().equals(type) || accepted.asText().equals("anonymous")) return;
        throw CliFailure.credential(
                "credential_type_required",
                "The configured credential type cannot use this method.",
                "Use a profile with an accepted credential type: " + operation.path("credentialTypes") + ".");
    }

    void execute(JsonNode op, ObjectNode request) throws Exception {
        context.operation = op;
        var profiles = new ProfileStore();
        String name = context.opt("profile", "default");
        var profile = profiles.get(name);
        boolean anonymous = op.path("credentialTypes").toString().contains("anonymous");
        requireCredential(op, profile);
        String token = anonymous ? "" : profiles.token(profile);
        var transport = new ControlTransport(profile, token, context.integer("timeout", 30, 1, 300));
        if (!op.path("mutates").asBoolean()) {
            if (context.flag("wait")) results.nativePrint(ReadWait.observe(context, responses, transport, request));
            else if (context.flag("page-all")) paginatePages(request, transport);
            else results.print(responses.read(transport, request, null));
            return;
        }
        if (anonymous) {
            results.print(responses.read(transport, request, null));
            return;
        }
        var identity = request.deepCopy();
        identity.remove("file");
        String fingerprint =
                hash(profile.path("baseUrl").asText() + ":" + JSON.writeValueAsString(canonical(identity)));
        context.invocationId = context.opt(
                "invocation-id",
                context.flag("new-invocation") ? UUID.randomUUID().toString() : fingerprint);
        try (var journal = new InvocationJournal(profiles.home, name, context.invocationId, token)) {
            var saved = journal.load();
            if (saved != null) {
                if (context.options.containsKey("idempotency-key")
                        && !context.required("idempotency-key")
                                .equals(saved.path("key").asText()))
                    throw CliFailure.refused(
                            "intent_mismatch",
                            "The original intent already has a different idempotency key.",
                            "Resume the original intent; a new key must not be used to guess an unknown outcome.");
                if (!saved.path("fingerprint").asText().equals(fingerprint))
                    throw CliFailure.refused(
                            "intent_mismatch",
                            "Invocation ID already belongs to a different immutable request.",
                            "Resume its original request, or explicitly choose a new invocation for a revised intent.");
                if (saved.has("result")) {
                    var result = (ObjectNode) saved.path("result").deepCopy();
                    result.put("replayed", true);
                    results.print(result);
                    return;
                }
                if (saved.has("rejection")) {
                    var rejected = saved.path("rejection");
                    var failure = new CliFailure(
                            rejected.path("code").asText(),
                            "This immutable intent was previously rejected.",
                            rejected.path("exit").asInt(1),
                            "Inspect current facts and correct the intent; use a new invocation for a changed request.");
                    failure.httpStatus = rejected.path("status").asInt();
                    if (rejected.has("violations"))
                        failure.violations = JSON.convertValue(
                                rejected.path("violations"),
                                new com.fasterxml.jackson.core.type.TypeReference<List<CliFailure.Violation>>() {});
                    failure.violationsTruncated =
                            rejected.path("violationsTruncated").asBoolean();
                    context.state = "rejected";
                    throw failure;
                }
                context.state = "unknown";
                InvocationJournal.requireReplayWindow(saved);
                if (!op.path("idempotencyMode").asText().equals("server-key")) {
                    throw CliFailure.refused(
                            "outcome_unknown",
                            "An unkeyed write has already been attempted; automatic replay is unsafe.",
                            "Inspect current resource/audit facts before deciding on a new intent.");
                }
            } else {
                saved = JSON.createObjectNode()
                        .put("createdAt", Instant.now().toString())
                        .put("fingerprint", fingerprint)
                        .put("baseUrl", profile.path("baseUrl").asText())
                        .put("operationId", op.path("operationId").asText());
                saved.set("request", request);
                if (op.path("idempotencyMode").asText().equals("server-key"))
                    saved.put(
                            "key",
                            context.opt(
                                    "idempotency-key",
                                    "cli-" + hash(context.invocationId).substring(0, 48)));
                journal.save(saved); // 发请求前先保存加密意图，断线后才能确定恢复用哪个原键。
            }
            ObjectNode result;
            try {
                result = responses.read(
                        transport, request, saved.has("key") ? saved.path("key").asText() : null);
            } catch (CliFailure failure) {
                if (confirmedRejection(failure)) {
                    var rejection = saved.putObject("rejection")
                            .put("code", failure.code)
                            .put("exit", failure.exit)
                            .put("status", failure.httpStatus);
                    rejection.set("violations", JSON.valueToTree(failure.violations));
                    rejection.put("violationsTruncated", failure.violationsTruncated);
                    journal.save(saved);
                }
                throw failure;
            }
            saved.set("result", result);
            journal.save(saved);
            results.print(result);
        }
    }

    private static boolean confirmedRejection(CliFailure failure) {
        // 请求超时、限流和幂等处理中都不能证明业务已拒绝，不能永久阻止恢复。
        return failure.httpStatus >= 400
                && failure.httpStatus < 500
                && failure.httpStatus != 408
                && failure.httpStatus != 429
                && !(failure.httpStatus == 409 && failure.code.equals("idempotency_request_in_progress"));
    }

    /** 每次输出一页并保留游标；达到上限或中断时，不能声称已经读取全部数据。 */
    private void paginatePages(ObjectNode request, ControlTransport transport) throws Exception {
        int limit = context.integer("page-limit", 10, 1, 10000), delay = context.integer("page-delay", 100, 0, 60000);
        var seen = new HashSet<String>();
        var current = request.deepCopy();
        for (int page = 0; page < limit; page++) {
            var result = responses.read(transport, current, null);
            results.print(result);
            JsonNode next = result.path("data").path("nextCursor");
            if (next.isMissingNode())
                throw CliFailure.error(
                        "pagination_contract",
                        "Response lacks nextCursor; completion is unknown.",
                        "Include nextCursor in the field mask and inspect the server contract.");
            if (next.isNull()) return;
            if (!next.isTextual() || next.asText().isEmpty() || !seen.add(next.asText()))
                throw CliFailure.error(
                        "cursor_loop",
                        "Server returned an invalid or repeated cursor.",
                        "Use the last emitted page to investigate; do not assume completion.");
            if (page + 1 == limit) {
                context.error.println("Page limit reached; continue with the last page's nextCursor.");
                return;
            }
            current.put("path", query(request.path("path").asText(), "cursor", next.asText()));
            if (delay > 0) Thread.sleep(delay);
        }
    }

    private static String query(String path, String name, String value) {
        String[] pieces = path.split("\\?", 2);
        var parts = new ArrayList<String>();
        if (pieces.length == 2)
            for (String s : pieces[1].split("&")) if (!s.startsWith(encode(name) + "=")) parts.add(s);
        parts.add(encode(name) + "=" + encode(value));
        return pieces[0] + "?" + String.join("&", parts);
    }
}
