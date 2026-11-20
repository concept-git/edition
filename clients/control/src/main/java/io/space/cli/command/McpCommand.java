package io.space.cli.command;

import static io.space.cli.shared.JsonSupport.*;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import io.modelcontextprotocol.json.jackson2.JacksonMcpJsonMapper;
import io.modelcontextprotocol.server.McpServer;
import io.modelcontextprotocol.server.McpServerFeatures;
import io.modelcontextprotocol.server.transport.StdioServerTransportProvider;
import io.modelcontextprotocol.spec.McpSchema;
import io.space.cli.execution.ControlCall;
import io.space.cli.shared.CliFailure;
import io.space.cli.state.ProfileStore;
import java.io.*;
import java.nio.file.Path;
import java.util.*;
import java.util.concurrent.CountDownLatch;

/** 官方 MCP SDK 的 stdio 入口。工具参数直接调用共用执行器，不经 shell 拼接命令。 */
final class McpCommand implements java.util.concurrent.Callable<Void> {
    private String resources;
    private String profile;
    private Path fileRoot;
    private boolean allowWrite;

    static void register(CliCommand root, ControlCall context) throws Exception {
        var command = root.add(
                "mcp",
                "Typed Control tools over stdio. Session-only/secret lifecycle methods are excluded; default read-only.",
                () -> {
                    var server = new McpCommand(context);
                    server.resources = context.opt("resources", "");
                    server.fileRoot = Path.of(context.opt("file-root", "."));
                    server.allowWrite = context.flag("allow-write");
                    server.call();
                });
        command.examples("spacectl mcp --resources control.spaces.pages --profile automation");
        command.option("resources", String.class, "Comma-separated exact resource prefixes, e.g. control.spaces.pages")
                .setRequired(true);
        command.option("file-root", Path.class, "Fixed root for all tool file inputs/outputs")
                .setDefaultValues(List.of("."));
        command.option(
                "allow-write",
                boolean.class,
                "Register selected write methods; server authorization and per-call confirmation still apply");
    }

    private final ControlCall parent;

    McpCommand(ControlCall parent) {
        this.parent = parent;
    }

    @Override
    public Void call() throws Exception {
        profile = parent.opt("profile", "default");
        // 身份和文件根在启动时固定；工具调用不能临时切换到其他身份或目录。
        var prefixes = Set.of(resources.split(","));
        for (String prefix : prefixes)
            if (!prefix.matches("control(?:\\.[a-z][A-Za-z0-9]*)*"))
                throw CliFailure.input("Invalid resource prefix.", "spacectl mcp --resources control.spaces.pages");
        fileRoot = fileRoot.toRealPath();
        var profiles = new ProfileStore();
        JsonNode fixedProfile = profiles.get(profile).deepCopy();
        var specifications = new ArrayList<McpServerFeatures.SyncToolSpecification>();
        var schemas = new CommandSchema(parent.catalog);
        for (JsonNode op : parent.catalog.allOperations()) {
            String name = op.path("apiCommand").asText();
            if (prefixes.stream().noneMatch(p -> name.startsWith(p + "."))) continue;
            if (op.path("mutates").asBoolean() && !allowWrite
                    || !op.path("credentialTypes").toString().contains("management_token")
                    || op.path("capabilities").path("secretOutput").asBoolean()
                    || op.path("capabilities").path("secretInput").asBoolean()) continue;
            var input = inputSchema(op);
            var tool = McpSchema.Tool.builder(name, map(input))
                    .description(
                            schemas.describe(name, false).path("description").asText())
                    .annotations(McpSchema.ToolAnnotations.builder()
                            .readOnlyHint(!op.path("mutates").asBoolean())
                            .destructiveHint(op.path("highImpact").asBoolean())
                            .idempotentHint(!op.path("idempotencyMode").asText().equals("explicit-single-attempt"))
                            .build())
                    .build();
            specifications.add(McpServerFeatures.SyncToolSpecification.builder()
                    .tool(tool)
                    .callHandler((exchange, request) -> call(op, input, request.arguments(), fixedProfile))
                    .build());
        }
        if (specifications.isEmpty())
            throw CliFailure.input(
                    "No eligible tools match the selected resources.",
                    "Select a resource with PAT-capable methods; secret/session-only methods remain excluded.");
        var end = new CountDownLatch(1);
        var input = new FilterInputStream(parent.input) {
            @Override
            public int read(byte[] b, int off, int len) throws IOException {
                int count = super.read(b, off, len);
                if (count == -1) end.countDown();
                return count;
            }

            @Override
            public int read() throws IOException {
                int value = super.read();
                if (value == -1) end.countDown();
                return value;
            }
        };
        var transport = new StdioServerTransportProvider(
                new JacksonMcpJsonMapper(JSON), input, parent.output, 16 * 1024 * 1024);
        var server = McpServer.sync(transport)
                .serverInfo("spacectl", io.space.cli.shared.BuildInfo.VERSION)
                .capabilities(
                        McpSchema.ServerCapabilities.builder().tools(false).build())
                .validateToolInputs(false)
                .tools(specifications)
                .build();
        try {
            // 由共用校验器输出脱敏错误，避免第三方校验器直接回显秘密值。
            end.await();
        } finally {
            server.close();
        }
        return null;
    }

    private McpSchema.CallToolResult call(
            JsonNode op, ObjectNode schema, Map<String, Object> arguments, JsonNode fixedProfile) {
        var context = new ControlCall(parent.catalog);
        context.command = op.path("apiCommand").asText().replace('.', ' ');
        boolean failed = false;
        try {
            JsonNode supplied = JSON.valueToTree(arguments == null ? Map.of() : arguments);
            context.validate(schema, supplied, "tool arguments");
            if (!fixedProfile.equals(new ProfileStore().get(profile)))
                throw CliFailure.input("MCP profile changed after startup.", "Restart MCP with the intended profile.");
            context.options.put("profile", profile);
            context.options.put("file-root", fileRoot.toString());
            context.configureInput(supplied);
            context.options.put("dry-run", supplied.path("dryRun").asText("false"));
            context.options.put("yes", supplied.path("confirm").asText("false"));
            if (supplied.has("invocationId"))
                context.options.put(
                        "invocation-id", supplied.path("invocationId").asText());
            context.invoke(op);
        } catch (Exception error) {
            context.fail(error);
            failed = true;
        }
        var value = context.result();
        String text = value == null ? "" : value + "\n";
        var result = McpSchema.CallToolResult.builder().isError(failed).addTextContent(text);
        var metadata = context.metadata();
        if (!metadata.isEmpty()) result.meta(map(metadata));
        if (value != null && value.isObject()) result.structuredContent(map(value));
        return result.build();
    }

    private ObjectNode inputSchema(JsonNode op) {
        var root = JSON.createObjectNode().put("type", "object").put("additionalProperties", false);
        var props = root.putObject("properties");
        var params = props.putObject("params").put("type", "object").put("additionalProperties", false);
        var parameterFields = params.putObject("properties");
        var required = params.putArray("required");
        for (var p : op.path("parameters")) {
            String name = p.path("name").asText();
            parameterFields.set(
                    name,
                    p.has("schema") ? p.path("schema") : JSON.createObjectNode().put("type", "string"));
            if (p.path("required").asBoolean() && !name.equals("Idempotency-Key")) required.add(name);
        }
        var mandatory = root.putArray("required");
        if (!required.isEmpty()) mandatory.add("params");
        if (op.path("capabilities").path("invocation").asBoolean()) {
            props.putObject("invocationId")
                    .put("type", "string")
                    .put("pattern", "^[A-Za-z0-9_-]{1,100}$")
                    .put(
                            "description",
                            "Required write intent ID. Use a new ID for each independent intent; reuse the original ID and inputs only to recover that intent. A replayed result is historical, not current resource state.");
            mandatory.add("invocationId");
        }
        if (op.path("capabilities").path("jsonInput").asBoolean()) props.set("json", parent.catalog.bodySchema(op));
        if (op.path("capabilities").path("binaryInput").asBoolean())
            props.putObject("upload").put("type", "string");
        if (op.path("requestBody").path("required").asBoolean()) {
            if (props.has("json") && props.has("upload")) {
                var alternatives = root.putArray("oneOf");
                for (String source : List.of("json", "upload")) {
                    var branch = alternatives.addObject();
                    branch.putArray("required").add(source);
                }
            } else mandatory.add(props.has("json") ? "json" : "upload");
        }
        if (op.path("capabilities").path("binaryOutput").asBoolean())
            props.putObject("output").put("type", "string");
        props.putObject("dryRun").put("type", "boolean");
        if (ControlCall.supportsWait(op)) props.set("wait", ControlCall.waitSchema());
        if (op.path("highImpact").asBoolean()) props.putObject("confirm").put("type", "boolean");
        return parent.catalog.schemaDocument(root);
    }

    private static Map<String, Object> map(JsonNode value) {
        return JSON.convertValue(value, new com.fasterxml.jackson.core.type.TypeReference<>() {});
    }
}
