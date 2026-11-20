package io.space.cli.execution;

import static io.space.cli.shared.JsonSupport.JSON;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import io.space.cli.shared.CliFailure;
import java.time.Duration;
import java.util.Map;
import java.util.UUID;

/** 仅等待同一个只读目标；服务端定义终态，本模块只拥有预算和固定目标。 */
final class ReadWait {
    private ReadWait() {}

    static boolean supports(JsonNode op) {
        return !op.path("mutates").asBoolean()
                && (op.path("operationId").asText().equals("viewImportJob")
                        || op.path("operationId").asText().equals("siteDeliveryStatus"));
    }

    static ObjectNode schema() {
        var schema = JSON.createObjectNode().put("type", "object").put("additionalProperties", false);
        var fields = schema.putObject("properties");
        fields.putObject("timeoutSeconds")
                .put("type", "integer")
                .put("minimum", 1)
                .put("maximum", 300)
                .put("default", 60);
        fields.putObject("maxAttempts")
                .put("type", "integer")
                .put("minimum", 1)
                .put("maximum", 100)
                .put("default", 20);
        fields.putObject("intervalMilliseconds")
                .put("type", "integer")
                .put("minimum", 0)
                .put("maximum", 60000)
                .put("default", 1000);
        fields.putObject("targetEpoch")
                .put("type", "integer")
                .put("minimum", 0)
                .put(
                        "description",
                        "Delivery only. Omit to freeze the first observed target; never follows a replacement target.");
        return schema;
    }

    static void configure(ControlCall context, JsonNode value) {
        context.validate(schema(), value, "wait");
        context.options.put("wait", "true");
        for (var field : Map.of(
                        "timeoutSeconds",
                        "wait-timeout",
                        "maxAttempts",
                        "wait-attempts",
                        "intervalMilliseconds",
                        "wait-interval",
                        "targetEpoch",
                        "target-epoch")
                .entrySet())
            if (value.has(field.getKey()))
                context.options.put(field.getValue(), value.path(field.getKey()).asText());
    }

    static void validate(ControlCall context, JsonNode operation) {
        boolean controls = context.options.keySet().stream()
                .anyMatch(name -> name.startsWith("wait-") || name.equals("target-epoch"));
        if (!context.flag("wait")) {
            if (controls)
                throw CliFailure.input(
                        "Wait controls require --wait.", "Select --wait with an explicit bounded read target.");
            return;
        }
        if (!supports(operation)
                || context.flag("inspect")
                || context.flag("page-all")
                || context.options.containsKey("output"))
            throw CliFailure.input(
                    "Waiting requires an eligible single-target read.",
                    "Use imports get or sites deliveries get with --wait.");
        context.integer("wait-timeout", 60, 1, 300);
        context.integer("wait-attempts", 20, 1, 100);
        context.integer("wait-interval", 1000, 0, 60000);
        if (context.options.containsKey("target-epoch")) {
            try {
                if (!operation.path("operationId").asText().equals("siteDeliveryStatus")
                        || Long.parseLong(context.opt("target-epoch", "")) < 0) throw new NumberFormatException();
            } catch (NumberFormatException invalid) {
                throw CliFailure.input(
                        "Invalid delivery target epoch.",
                        "Use a nonnegative delivery epoch; job targets use their original jobId.");
            }
        }
    }

    static ObjectNode observe(
            ControlCall context, ResponseReader responses, ControlTransport transport, JsonNode request)
            throws Exception {
        long started = System.nanoTime();
        int seconds = context.integer("wait-timeout", 60, 1, 300);
        int maximum = context.integer("wait-attempts", 20, 1, 100);
        int interval = context.integer("wait-interval", 1000, 0, 60000);
        long deadline = started + Duration.ofSeconds(seconds).toNanos();
        Long target =
                context.options.containsKey("target-epoch") ? Long.valueOf(context.opt("target-epoch", "")) : null;
        ObjectNode latest = null;
        String state = "budget_exhausted";
        boolean successful = false;
        boolean lastReadTimedOut = false;
        int attempts = 0;
        boolean delivery = context.operation.path("operationId").asText().equals("siteDeliveryStatus");
        while (attempts < maximum) {
            long remaining = deadline - System.nanoTime();
            if (remaining <= 0) break;
            // 共用连接池，但每次传输和读响应都受剩余总预算限制（包括不足一秒）。
            Duration timeout = Duration.ofNanos(Math.min(transport.timeout.toNanos(), remaining));
            attempts++;
            try {
                latest = responses.read(new ControlTransport(transport, timeout), request, null);
            } catch (java.net.http.HttpTimeoutException expired) {
                if (remaining > transport.timeout.toNanos()) throw expired;
                // 总预算截止不取消作业，也不丢失此前已经完成的观察；普通单请求超时仍报错。
                lastReadTimedOut = true;
                break;
            }
            var data = latest.path("data");
            if (!delivery) {
                String path = request.path("path").asText().split("\\?", 2)[0];
                String original = path.substring(path.lastIndexOf('/') + 1);
                boolean matches;
                try {
                    matches = UUID.fromString(data.path("id").asText()).equals(UUID.fromString(original));
                } catch (IllegalArgumentException invalid) {
                    matches = false;
                }
                if (!matches)
                    throw CliFailure.error(
                            "wait_contract",
                            "Job response differs from the original target.",
                            "Inspect the original jobId; waiting cannot follow a replacement job.");
            }
            if (!data.path("terminal").isBoolean() || !data.path("successful").isBoolean())
                throw CliFailure.error(
                        "wait_contract",
                        "Read target lacks typed completion facts.",
                        "Inspect the service and CLI contract version; do not infer completion from acceptance.");
            if (delivery) {
                if (!data.path("targetEpoch").isIntegralNumber()
                        || !data.path("targetEpoch").canConvertToLong()
                        || !(data.path("onlineEpoch").isNull()
                                || data.path("onlineEpoch").isIntegralNumber()
                                        && data.path("onlineEpoch").canConvertToLong()))
                    throw CliFailure.error(
                            "wait_contract", "Delivery target lacks epoch facts.", "Inspect the delivery contract.");
                if (target == null) target = data.path("targetEpoch").asLong();
                var current = data.path("current");
                if (!(current.isNull()
                        || current.isObject()
                                && current.path("epoch").isIntegralNumber()
                                && current.path("epoch").canConvertToLong()
                                && current.path("readable").isBoolean()))
                    throw CliFailure.error(
                            "wait_contract",
                            "Delivery current snapshot lacks typed epoch/readability facts.",
                            "Inspect the delivery contract.");
                if (current.path("epoch").canConvertToLong()
                        && current.path("epoch").asLong() == target
                        && current.path("readable").asBoolean()) {
                    state = "terminal";
                    successful = true;
                    break;
                }
                if (current.path("epoch").canConvertToLong()
                                && current.path("epoch").asLong() > target
                        || data.path("targetEpoch").asLong() != target) {
                    state = "superseded";
                    break;
                }
                if (data.path("status").asText().equals("disabled")) {
                    state = "failed";
                    break;
                }
                if (data.path("terminal").asBoolean()) {
                    state = "terminal";
                    break; // 对指定 epoch 的成功只由上面的 exact current + readable 证明。
                }
            }
            if (data.path("terminal").asBoolean()) {
                state = "terminal";
                successful = data.path("successful").asBoolean();
                break;
            }
            if (attempts == maximum) break;
            long suggested = data.path("nextPollAfterSeconds").canConvertToInt()
                    ? Math.max(0, Math.min(60, data.path("nextPollAfterSeconds").asInt())) * 1000L
                    : 0;
            long pause =
                    Math.min(Math.max(interval, suggested), Math.max(0, (deadline - System.nanoTime()) / 1_000_000));
            if (pause > 0) Thread.sleep(pause);
        }
        var result = JSON.createObjectNode();
        var wait = result.putObject("wait")
                .put("state", state)
                .put("successful", successful)
                .put("attempts", attempts)
                .put("elapsedMs", (System.nanoTime() - started) / 1_000_000)
                .put("timeoutSeconds", seconds)
                .put("maxAttempts", maximum);
        if (lastReadTimedOut) wait.put("lastReadTimedOut", true);
        if (target != null) wait.put("targetEpoch", target);
        result.set("observation", latest == null ? JSON.nullNode() : latest.path("data"));
        return result;
    }
}
