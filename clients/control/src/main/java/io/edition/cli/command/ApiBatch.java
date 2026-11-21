package io.edition.cli.command;

import static io.edition.cli.shared.JsonSupport.*;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import io.edition.cli.execution.ControlCall;
import io.edition.cli.shared.CliFailure;
import java.io.*;
import java.util.*;
import java.util.concurrent.*;

/** 独立项的有界批量执行。先校验全部输入，再执行；稳定的批次/项 ID 用于恢复原意图。 */
final class ApiBatch implements Callable<Void> {
    static ObjectNode schema() throws Exception {
        var schema = (ObjectNode) JSON.readTree("""
            {"type":"object","additionalProperties":false,"required":["id","items"],"properties":{
              "id":{"type":"string","pattern":"^[A-Za-z0-9_-]{1,64}$"},
              "items":{"type":"array","minItems":1,"maxItems":1000,"items":{
                "type":"object","additionalProperties":false,"required":["id","method","params"],"properties":{
                  "id":{"type":"string","pattern":"^[A-Za-z0-9_-]{1,64}$"},
                  "method":{"type":"string","pattern":"^control(?:[.][a-z][A-Za-z0-9]*){2,}$"},
                  "params":{"type":"object"},"json":{"type":"object"},"upload":{"type":"string"},"output":{"type":"string"},"wait":{"type":"object"}
            }}}}}
            """);
        ((ObjectNode) schema.at("/properties/items/items/properties")).set("wait", ControlCall.waitSchema());
        return schema;
    }

    private record Item(String id, ControlCall.Prepared prepared, ControlCall context) {}

    private final ControlCall parent;

    ApiBatch(ControlCall parent) {
        this.parent = parent;
    }

    @Override
    public Void call() throws Exception {
        ObjectNode batch = parent.read("json");
        parent.validate(schema(), batch, "batch");
        int parallel = parent.integer("parallel", 1, 1, 4);
        boolean trusted =
                parent.opt("json", "").startsWith("@") || parent.opt("json", "").equals("-");
        var items = new ArrayList<Item>();
        var ids = new HashSet<String>();
        for (var record : batch.path("items")) {
            String id = record.path("id").asText(),
                    method = record.path("method").asText();
            JsonNode op = parent.catalog.operation(method);
            if (!ids.add(id) || op == null)
                throw CliFailure.input(
                        "Duplicate item ID or unknown batch method.",
                        "Use stable unique IDs and methods discovered with editionctl control --help.");
            var context = new ControlCall(parent.catalog);
            context.command = method.replace('.', ' ');
            for (String option : List.of("profile", "file-root", "dry-run", "yes"))
                if (parent.options.containsKey(option)) context.options.put(option, parent.options.get(option));
            context.configureInput(record);
            if (trusted) context.options.put("trusted-json-input", "true");
            context.options.put(
                    "invocation-id", "batch-" + hash(batch.path("id").asText() + ":" + id));
            var prepared = context.prepare(op); // 全部项校验通过前，不发送任何业务请求。
            items.add(new Item(id, prepared, context));
        }
        int next = 0, done = 0, failed = 0;
        var pending = new ArrayDeque<Future<ObjectNode>>();
        // 最多保留 parallel 个在途任务；首错后停止新增任务，等待已提交项结束。
        try (var executor = Executors.newFixedThreadPool(parallel)) {
            while (next < items.size() || !pending.isEmpty()) {
                while (next < items.size()
                        && pending.size() < parallel
                        && (failed == 0 || parent.flag("continue-on-error"))) {
                    var item = items.get(next++);
                    pending.add(executor.submit(() -> run(item)));
                }
                if (pending.isEmpty()) break;
                var result = pending.removeFirst().get();
                done++;
                if (!result.path("ok").asBoolean()) failed++;
                parent.output.println(result);
            }
        }
        parent.output.println(JSON.createObjectNode()
                .put("kind", "requestSummary")
                .put("completedRequests", done)
                .put("failed", failed)
                .put("remaining", items.size() - next)
                .put("backgroundCompletionVerified", false));
        if (failed > 0)
            throw CliFailure.error(
                    "batch_partial",
                    "Batch contains failed items; already submitted items have finished.",
                    "Inspect each item and resume the same batch/item identities; separate dependent phases.");
        return null;
    }

    private ObjectNode run(Item item) {
        boolean success = true;
        try {
            item.prepared().invoke();
        } catch (Exception error) {
            item.context().fail(error);
            success = false;
        }
        var frame = JSON.createObjectNode().put("id", item.id()).put("ok", success);
        if (item.context().result() == null)
            frame.put("ok", false).put("error", "Invalid item output; inspect the original receipt.");
        else frame.set("result", item.context().result());
        frame.setAll(item.context().metadata());
        return frame;
    }
}
