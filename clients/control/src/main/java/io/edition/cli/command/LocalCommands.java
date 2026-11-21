package io.edition.cli.command;

import static io.edition.cli.shared.JsonSupport.JSON;

import com.fasterxml.jackson.databind.JsonNode;
import io.edition.cli.execution.ControlCall;
import io.edition.cli.shared.CliFailure;
import io.edition.cli.state.*;
import io.edition.cli.update.ReleaseUpdater;
import java.nio.file.*;
import java.util.*;

/** 固定命令使用 Aesh 模型注册，与动态 API 共用解析和失败边界。 */
final class LocalCommands {
    private final ControlCall context;

    LocalCommands(ControlCall context) {
        this.context = context;
    }

    void register(CliCommand root) throws Exception {
        var configure =
                root.add("configure", "Configure one Control origin and credential reference.", this::configure);
        configure.examples("editionctl configure --base-url https://control.example.com --token-env EDITION_PAT");
        configure
                .option("base-url", String.class, "HTTPS origin, no path or credentials")
                .setRequired(true);
        configure.option("token-env", String.class, "Secret-manager variable name; default OS keyring");
        configure
                .option("credential-type", String.class, "management_token (default), session, space_token")
                .setDefaultValues(List.of("management_token"));
        configure.option("ca-file", String.class, "Explicit PEM trust file");
        configure.option("auth-origin", String.class, "Console origin for Session lifecycle requests");
        configure.option("allow-http-loopback", boolean.class, "Allow isolated loopback HTTP fixtures only");
        var config = root.add("config", "Inspect profiles and designated credential references.", null);
        config.add("list", "Read nonsecret configuration.", this::configList).examples("editionctl config list");
        config.add(
                        "get",
                        "Read only the selected profile's nonsecret configuration; no HTTP or credential access.",
                        this::configGet)
                .examples("editionctl --profile automation config get");
        config.add(
                        "inspect",
                        "Inspect only the selected credential reference; local presence does not prove remote authentication or authorization.",
                        this::configInspect)
                .examples("editionctl --profile automation config inspect");
        var credentials = config.add("credential", "Import a credential into the selected profile OS keyring.", null);
        var set = credentials.add(
                "set", "Import a bearer into the OS credential store, without argv secrets.", this::setCredential);
        set.examples("secret-manager read space-pat | editionctl config credential set --stdin");
        set.option("stdin", boolean.class, "Read exactly one credential line").setRequired(true);
        var update = root.add("update", "Check, install, and roll back signed CLI releases.", null);
        var updateConfig = update.add(
                "configure",
                "Configure a signed update source, isolated from Control credentials.",
                this::configureUpdate);
        updateConfig.examples(
                "editionctl update configure --manifest-url https://releases.example.com/stable.json --public-key-file publisher.pem --auto check");
        updateConfig
                .option("manifest-url", String.class, "HTTPS release manifest")
                .setRequired(true);
        updateConfig
                .option("public-key-file", Path.class, "Trusted Ed25519 public key")
                .setRequired(true);
        updateConfig.option("install-dir", Path.class, "Managed distribution; separate from state directory");
        updateConfig
                .option("auto", String.class, "off/check/apply; compatible major versions only")
                .setDefaultValues(List.of("check"));
        updateConfig
                .option("interval-hours", Integer.class, "Check interval (1..720)")
                .setDefaultValues(List.of("24"));
        updateConfig.option("ca-file", Path.class, "Explicit publisher PEM trust file");
        updateConfig.option("allow-http-loopback", boolean.class, "Allow isolated loopback HTTP fixtures only");
        update.add(
                        "check",
                        "Verify the signed release manifest.",
                        () -> context.print(new ReleaseUpdater().check(true)))
                .examples("editionctl update check");
        update.add(
                        "status",
                        "Read installation and cached update state.",
                        () -> context.print(new ReleaseUpdater().status()))
                .examples("editionctl update status");
        var apply = update.add(
                "apply",
                "Verify and schedule installation after the current process exits.",
                () -> context.print(new ReleaseUpdater().schedule(context.flag("dry-run"), false)));
        apply.examples("editionctl update apply --dry-run");
        apply.option("dry-run", boolean.class, "Validate the signed plan without replacing the installation");
        var rollback = update.add(
                "rollback",
                "Schedule restoration of the verified previous version.",
                () -> context.print(new ReleaseUpdater().schedule(context.flag("dry-run"), true)));
        rollback.examples("editionctl update rollback --dry-run");
        rollback.option("dry-run", boolean.class, "Validate without replacing the installation");
        var control = root.add("control", "Manage Space resources through the selected Control profile.", null);
        for (String method : List.of("+receipt", "+resume")) {
            boolean resume = method.equals("+resume");
            var command = control.add(
                    method,
                    resume
                            ? "Resume the original intent; unknown unkeyed writes are refused."
                            : "Inspect a private immutable intent receipt.",
                    () -> receipt(context.opt("id", null), resume));
            command.examples("editionctl control " + method + " --id ORIGINAL_INTENT_ID");
            command.option("id", String.class, "Original stable intent ID").setRequired(true);
        }
    }

    private Path path(String name) {
        String value = context.opt(name, null);
        return value == null ? null : Path.of(value);
    }

    private void configure() throws Exception {
        new ProfileStore()
                .configure(
                        context.opt("profile", "default"),
                        context.opt("base-url", null),
                        context.opt("token-env", null),
                        context.opt("credential-type", "management_token"),
                        context.flag("allow-http-loopback"),
                        context.opt("ca-file", null),
                        context.opt("auth-origin", null));
        print(JSON.createObjectNode()
                .put("profile", context.opt("profile", "default"))
                .put("configured", true));
    }

    private void configList() throws Exception {
        print(new ProfileStore().config());
    }

    private void configGet() throws Exception {
        String name = context.opt("profile", "default");
        var result = JSON.createObjectNode().put("profile", name);
        result.set("configuration", new ProfileStore().get(name));
        context.print(result); // 本地诊断不启动后台更新或远程认证。
    }

    private void configInspect() throws Exception {
        context.print(new ProfileStore().inspect(context.opt("profile", "default")));
    }

    private void setCredential() throws Exception {
        if (!context.flag("stdin"))
            throw CliFailure.input("Credential input requires --stdin.", "editionctl config credential set --stdin");
        var profiles = new ProfileStore();
        profiles.store(
                profiles.get(context.opt("profile", "default")),
                context.readText("-").strip());
        print(JSON.createObjectNode().put("stored", true));
    }

    private void configureUpdate() throws Exception {
        int interval = Integer.parseInt(context.opt("interval-hours", "24"));
        if (interval < 1 || interval > 720)
            throw CliFailure.input("Invalid --interval-hours.", "Use a value from 1 to 720.");
        var updater = new ReleaseUpdater();
        updater.configure(new ReleaseUpdater.Configuration(
                context.opt("manifest-url", null),
                path("public-key-file"),
                path("install-dir"),
                interval,
                context.opt("auto", "check"),
                context.flag("allow-http-loopback"),
                path("ca-file")));
        context.print(updater.config());
    }

    private void print(JsonNode value) throws Exception {
        context.print(value);
        ReleaseUpdater.background(context.error);
    }

    private void receipt(String id, boolean resume) throws Exception {
        context.receipt(id, resume);
        ReleaseUpdater.background(context.error);
    }
}
