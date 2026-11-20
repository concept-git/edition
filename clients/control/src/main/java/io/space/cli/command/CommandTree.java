package io.space.cli.command;

import static io.space.cli.shared.JsonSupport.JSON;

import io.space.cli.execution.ControlCall;
import java.util.*;

/** 只注册命令和适配原生参数；Aesh 解析 argv；共用执行器处理业务与失败。 */
final class CommandTree {
    private final ControlCall context;
    private CliCommand commandRoot;

    CommandTree(ControlCall context) {
        this.context = context;
    }

    int execute(String... args) throws Exception {
        var root = new CliCommand(
                "spacectl", "Space Control CLI: predictable calls, defense in depth, bounded context.", null);
        commandRoot = root;
        root.examples("spacectl schema control --brief", "spacectl configure --help");
        root.option("profile", String.class, "Preconfigured identity and origin")
                .setInherited(true);
        new LocalCommands(context).register(root);
        var schema =
                root.add("schema", "Inspect a method, type, or CLI helper as JSON, without credentials.", this::schema);
        schema.argument("METHOD_OR_TYPE", "Dotted method or type name");
        schema.option("resolve-refs", boolean.class, "Expand references with cycle and size limits");
        schema.option("brief", boolean.class, "Compact JSON without common option help; retain method constraints");
        schema.examples("spacectl schema control.spaces.list --brief", "spacectl schema control.PageDetail");
        McpCommand.register(root, context);

        for (var group : context.catalog.index.path("groups").properties())
            root.path(group.getKey(), group.getValue().asText(), null);

        // 索引建立浅层命令树；只加载本次选中的方法契约，帮助请求不读取全部类型。
        String selected = selected(args);
        for (var entries = context.catalog.index.path("commands").properties().iterator(); entries.hasNext(); ) {
            var entry = entries.next();
            String name = entry.getKey();
            String inspectName = inspectName(name);
            boolean active = selected.equals(name) || !inspectName.isEmpty() && selected.equals(inspectName);
            var op = active ? context.catalog.operation(name) : null;
            var leaf = root.path(
                    name,
                    active && selected.equals(name)
                            ? op.path("description").asText()
                            : entry.getValue().path("description").asText().split("\\. ", 2)[0],
                    api(name, false));
            if (!inspectName.isEmpty()) {
                var inspect = root.path(
                        inspectName,
                        selected.equals(inspectName)
                                ? op.path("description").asText()
                                : "Read this resource with HTTP status and headers.",
                        api(name, true));
                if (selected.equals(inspectName)) leaf = inspect;
            }
            if (!active) continue;
            var cap = op.path("capabilities");
            leaf.option("params", String.class, "Native API parameter JSON, @FILE, or - (stdin)");
            if (cap.path("jsonInput").asBoolean())
                leaf.option(
                        "json", String.class, "Native API body JSON, @FILE, or - (stdin); secrets require file/stdin");
            if (cap.path("binaryInput").asBoolean()) {
                leaf.option("upload", String.class, "Existing file under --file-root");
                leaf.option("upload-content-type", String.class, "Declared media type");
            }
            leaf.option("format", String.class, "json (default), table, yaml, csv");
            if (cap.path("binaryOutput").asBoolean())
                leaf.option(
                        "output",
                        String.class,
                        "Binary destination; must not exist; use --format for JSON presentation");
            leaf.option("file-root", String.class, "Allowed input/output root (default: current directory)");
            leaf.option("timeout", Integer.class, "Request timeout in seconds (1..300; default 30)");
            leaf.option(
                    "dry-run",
                    Boolean.class,
                    "Validate locally; no business HTTP, credential access, or journal writes");
            if (cap.path("confirmation").asBoolean())
                leaf.option(
                        "yes", Boolean.class, "Confirm the intended high-impact target; does not bypass authorization");
            if (cap.path("invocation").asBoolean()) {
                leaf.option("invocation-id", String.class, "Stable intent ID; default derives from immutable request");
                leaf.option(
                        "new-invocation", Boolean.class, "Explicitly request a distinct effect for the same payload");
            }
            if (cap.path("secretOutput").asBoolean())
                leaf.option("reveal-secret", Boolean.class, "Include one-time secrets; use a private destination");
            if (cap.path("pagination").asBoolean()) {
                leaf.option("page-all", Boolean.class, "Stream one API page per NDJSON line");
                leaf.option("page-limit", Integer.class, "Maximum pages (default 10)");
                leaf.option("page-delay", Integer.class, "Delay between pages in milliseconds (default 100)");
            }
            if (ControlCall.supportsWait(op) && !selected.equals(inspectName)) {
                leaf.option(
                        "wait", Boolean.class, "Poll this original read target only; never submits or cancels work");
                leaf.option("wait-timeout", Integer.class, "Total wait seconds (1..300; default 60)");
                leaf.option("wait-attempts", Integer.class, "Maximum reads (1..100; default 20)");
                leaf.option("wait-interval", Integer.class, "Minimum poll delay milliseconds (0..60000; default 1000)");
                if (op.path("operationId").asText().equals("siteDeliveryStatus"))
                    leaf.option(
                            "target-epoch",
                            Long.class,
                            "Original delivery epoch; default freezes the first observed target");
            }
            leaf.examples(
                    io.space.cli.contract.ContractCatalog.example(op)
                            .replace(
                                    name.replace('.', ' '),
                                    selected.equals(inspectName)
                                            ? inspectName.replace('.', ' ')
                                            : name.replace('.', ' ')),
                    "spacectl schema " + (selected.equals(inspectName) ? inspectName : name));
        }
        var batch = root.path(
                "control.+batch",
                "Validate every item, then execute independent items with stable intent IDs.",
                new ApiBatch(context)::call);
        batch.option("json", String.class, "BatchRequest from @FILE or -; schema control.BatchRequest");
        batch.option("file-root", String.class, "Allowed file root (default current directory)");
        batch.option("parallel", Integer.class, "Independent items at once (1..4; default 1)");
        for (String flag : List.of("dry-run", "yes", "continue-on-error")) batch.option(flag, Boolean.class, flag);
        batch.examples("spacectl schema control.BatchRequest", "spacectl control +batch --json @batch.json --dry-run");
        return root.execute(context, args);
    }

    private CliCommand.Action api(String name, boolean inspect) {
        return () -> {
            if (inspect) context.options.put("inspect", "true");
            context.invoke(context.catalog.operation(name));
        };
    }

    private void schema() throws Exception {
        boolean brief = context.flag("brief");
        var schema = new CommandSchema(context.catalog, commandRoot)
                .describe(context.opt("target", ""), context.flag("resolve-refs"), brief);
        var writer = brief ? JSON.writer() : JSON.writerWithDefaultPrettyPrinter();
        context.output.println(writer.writeValueAsString(schema));
    }

    private String selected(String[] args) {
        String name = "";
        for (int i = 0; i < args.length; i++) {
            if (args[i].equals("--profile")) {
                i++;
                continue;
            }
            if (args[i].startsWith("--profile=")) continue;
            if (args[i].equals("schema")) {
                for (int position = i + 1; position < args.length; position++) {
                    if (args[position].equals("--profile")) {
                        position++;
                        continue;
                    }
                    if (!args[position].startsWith("-")) return args[position];
                }
                return "";
            }
            if (args[i].startsWith("-")) break;
            name += (name.isEmpty() ? "" : ".") + args[i];
            if (context.catalog.index.path("commands").has(name)) return name;
        }
        return name;
    }

    static String inspectName(String method) {
        if (method.equals("control.spaces.pages.get")) return "";
        if (method.equals("control.spaces.pages.content.get")) return "control.spaces.pages.+inspect";
        return method.endsWith(".get") ? method.substring(0, method.length() - 3) + "+inspect" : "";
    }
}
