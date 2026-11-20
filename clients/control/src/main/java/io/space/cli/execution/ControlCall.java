package io.space.cli.execution;

import static io.space.cli.shared.JsonSupport.JSON;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import io.space.cli.contract.ContractCatalog;
import io.space.cli.shared.CliFailure;
import io.space.cli.state.InvocationJournal;
import io.space.cli.state.ProfileStore;
import java.io.*;
import java.util.*;

/** CLI、MCP、批量的原生调用入口；调用者适配输入，执行状态与恢复归本模块所有。 */
public final class ControlCall {
    public final ContractCatalog catalog;
    public final InputStream input;
    public final PrintStream output;
    public final PrintStream error;
    public final Map<String, String> options = new HashMap<>();
    final long started = System.nanoTime();
    public String command = "";
    String invocationId;
    int httpStatus;
    String state;
    boolean replayed;
    boolean stdinUsed;
    com.fasterxml.jackson.databind.JsonNode operation;
    JsonNode result;

    private final CallOutput results;
    private final ControlOperations operations;
    final Runnable beforeExecution;

    /** 嵌入式调用使用类型化结果；CLI 仍使用显式提供的 IO。 */
    public ControlCall(ContractCatalog catalog) {
        this(
                catalog,
                InputStream.nullInputStream(),
                new PrintStream(OutputStream.nullOutputStream()),
                new PrintStream(OutputStream.nullOutputStream()));
    }

    public ControlCall(ContractCatalog catalog, InputStream input, PrintStream output, PrintStream error) {
        this(catalog, input, output, error, () -> {});
    }

    public ControlCall(
            ContractCatalog catalog,
            InputStream input,
            PrintStream output,
            PrintStream error,
            Runnable beforeExecution) {
        this.catalog = catalog;
        this.input = input;
        this.output = output;
        this.error = error;
        this.beforeExecution = beforeExecution;
        results = new CallOutput(this);
        operations = new ControlOperations(this, results);
    }

    public String opt(String key, String fallback) {
        return options.getOrDefault(key, fallback);
    }

    public boolean flag(String key) {
        return Boolean.parseBoolean(opt(key, "false"));
    }

    String required(String key) {
        if (!options.containsKey(key))
            throw CliFailure.input(
                    "Missing --" + key + ".",
                    "spacectl " + command + " --" + key + " VALUE; see spacectl " + command + " --help");
        return options.get(key);
    }

    public int integer(String key, int fallback, int min, int max) {
        try {
            int n = Integer.parseInt(opt(key, "" + fallback));
            if (n >= min && n <= max) return n;
        } catch (NumberFormatException ignored) {
        }
        throw CliFailure.input("Invalid --" + key + ".", "Use a value from " + min + " to " + max + ".");
    }

    String schemaHint() {
        if (command.equals("control +batch")) return "spacectl schema control.BatchRequest";
        String method = operation == null
                ? command.replace(' ', '.')
                : operation.path("apiCommand").asText();
        return catalog.operation(method) == null ? "spacectl " + command + " --help" : "spacectl schema " + method;
    }

    String resumeHint() {
        if (invocationId != null
                && operation != null
                && !operation.path("idempotencyMode").asText().equals("server-key"))
            return "Inspect the original receipt: spacectl control +receipt --profile "
                    + opt("profile", "default") + " --id " + invocationId
                    + ". Query current facts; unknown unkeyed writes must not be replayed.";
        if (invocationId != null)
            return "Inspect spacectl control +receipt --profile " + opt("profile", "default") + " --id " + invocationId
                    + ". Query current facts before replaying the original intent with spacectl control +resume --profile "
                    + opt("profile", "default") + " --id " + invocationId + ".";
        return operation != null && operation.path("mutates").asBoolean()
                ? "Query the original outcome. Do not resubmit an unknown write without evidence."
                : "Check the configured service and retry this read.";
    }

    /** 输出信封由各入口决定；执行事实仅由执行模块投影。 */
    public ObjectNode metadata() {
        var metadata = JSON.createObjectNode();
        if (invocationId != null) metadata.put("invocationId", invocationId).put("replayed", replayed);
        if (httpStatus > 0) metadata.put("httpStatus", httpStatus);
        if (state != null) metadata.put("state", state);
        return metadata;
    }

    public JsonNode result() {
        return result;
    }

    /** MCP 与批量共享原生输入适配；调用方先校验各自的信封。 */
    public void configureInput(JsonNode supplied) throws Exception {
        for (String field : List.of("params", "json", "upload", "output"))
            if (supplied.has(field)) {
                var value = supplied.get(field);
                options.put(
                        field,
                        field.equals("params") || field.equals("json")
                                ? JSON.writeValueAsString(value)
                                : value.asText());
            }
        if (supplied.has("wait")) configureWait(supplied.path("wait"));
    }

    public ObjectNode read(String option) throws Exception {
        return new RequestInput(this).read(option);
    }

    public String readText(String source) throws Exception {
        return new RequestInput(this).readText(source);
    }

    public void validate(JsonNode schema, JsonNode value, String where) {
        new RequestInput(this).validate(schema, value, where);
    }

    public static boolean supportsWait(JsonNode operation) {
        return ReadWait.supports(operation);
    }

    public static ObjectNode waitSchema() {
        return ReadWait.schema();
    }

    public void configureWait(JsonNode value) {
        ReadWait.configure(this, value);
    }

    public void print(JsonNode value) throws Exception {
        results.nativePrint(value);
    }

    public int fail(Exception failure) {
        return results.fail(failure);
    }

    public void invoke(JsonNode operation) throws Exception {
        prepare(operation).invoke();
    }

    /** 全部预校验结束后才执行；保存本次已读的请求，避免批量再读文件或 stdin。 */
    public Prepared prepare(JsonNode operation) throws Exception {
        return new Prepared(operation, operations.prepare(operation));
    }

    public final class Prepared {
        private final JsonNode operation;
        private final ObjectNode request;
        private final Map<String, String> validatedOptions;
        private final String validatedCommand;

        private Prepared(JsonNode operation, ObjectNode request) {
            this.operation = operation;
            this.request = request;
            validatedOptions = Map.copyOf(options);
            validatedCommand = command;
        }

        public void invoke() throws Exception {
            // 调用选项与已校验请求一起固定；调用实例不跨线程共享。
            options.clear();
            options.putAll(validatedOptions);
            command = validatedCommand;
            operations.invoke(operation, request);
        }
    }

    public void receipt(String id, boolean resume) throws Exception {
        InvocationJournal.validateId(id);
        var profiles = new ProfileStore();
        String name = this.opt("profile", "default");
        var profile = profiles.get(name);
        this.invocationId = id;
        ObjectNode saved = null;
        if (InvocationJournal.exists(profiles.home, name, id)) {
            try (var journal = new InvocationJournal(profiles.home, name, id, profiles.token(profile))) {
                saved = journal.load();
            }
        }
        if (saved == null)
            throw CliFailure.input(
                    "Original intent is absent from selected profile '" + name + "'.",
                    "Use the same --profile as the original receipt and keep --id " + id
                            + ". Inspect with spacectl --profile ORIGINAL_PROFILE control +receipt --id " + id + ".");
        if (!saved.path("baseUrl").asText().equals(profile.path("baseUrl").asText()))
            throw CliFailure.input(
                    "Profile origin differs from the saved intent.", "Restore the original origin before resuming.");
        if (resume) {
            JsonNode operation = this.catalog.byWire(saved.path("operationId").asText());
            if (operation == null)
                throw CliFailure.input(
                        "Original operation is absent from this contract.",
                        "Inspect the saved intent with the matching trusted CLI version.");
            this.options.put("invocation-id", id);
            operations.execute(operation, (ObjectNode) saved.path("request"));
        } else {
            var receipt = saved.deepCopy();
            receipt.remove(List.of("request", "key", "result"));
            receipt.put("hasResult", saved.has("result"));
            results.nativePrint(receipt);
        }
    }
}
