package io.edition.cli.state;

import static io.edition.cli.shared.JsonSupport.*;

import com.fasterxml.jackson.databind.*;
import com.fasterxml.jackson.databind.node.*;
import com.github.javakeyring.Keyring;
import io.edition.cli.shared.CliFailure;
import io.edition.cli.shared.PrivateFiles;
import java.net.URI;
import java.nio.channels.FileChannel;
import java.nio.file.*;
import java.util.*;

/** 配置只存凭据引用。真正的 bearer 在执行时从环境变量或系统凭据库读取。 */
public final class ProfileStore {
    public final Path home;

    public ProfileStore() throws Exception {
        home = PrivateFiles.home();
    }
    /** 预演只读取非秘密的服务地址，不创建状态目录，也不读取或刷新凭据。 */
    public static URI configuredOrigin(String name) throws Exception {
        validName(name);
        Path file = PrivateFiles.location().resolve("profiles.json");
        if (!Files.exists(file)) return null;
        if (Files.isSymbolicLink(file))
            throw CliFailure.input("Refusing symbolic-link profile.", "Use a regular private configuration file.");
        JsonNode profile = JSON.readTree(Files.readAllBytes(file)).path(name);
        return profile.isMissingNode()
                ? null
                : origin(
                        profile.path("baseUrl").asText(),
                        profile.path("allowHttpLoopback").asBoolean());
    }

    public ObjectNode config() throws Exception {
        Path path = home.resolve("profiles.json");
        if (!Files.exists(path)) return JSON.createObjectNode();
        PrivateFiles.privateMode(path, false);
        return (ObjectNode) JSON.readTree(Files.readAllBytes(path));
    }

    public void configure(
            String name, String url, String env, String type, boolean loopback, String ca, String authOrigin)
            throws Exception {
        validName(name);
        URI origin = origin(url, loopback);
        if (env != null && !env.matches("[A-Za-z_][A-Za-z0-9_]*"))
            throw CliFailure.input(
                    "Invalid environment variable name.",
                    "editionctl configure --base-url https://control.example.com --token-env EDITION_PAT");
        if (!Set.of("management_token", "session", "space_token").contains(type))
            throw CliFailure.input("Unknown credential type.", "Use --credential-type management_token.");
        Path lock = home.resolve("configuration.lock");
        if (Files.isSymbolicLink(lock))
            throw CliFailure.input("Refusing symbolic-link configuration lock.", "Use private state.");
        try (var channel = FileChannel.open(lock, StandardOpenOption.CREATE, StandardOpenOption.WRITE)) {
            PrivateFiles.privateMode(lock, false);
            try (var held = channel.tryLock()) {
                if (held == null)
                    throw CliFailure.refused(
                            "state_busy",
                            "Configuration is in use.",
                            "Retry after the other configure command completes.");
                var cfg = config();
                var profile = cfg.putObject(name);
                profile.put("baseUrl", origin.toString())
                        .put("credentialType", type)
                        .put("allowHttpLoopback", loopback);
                if (env != null) profile.put("tokenEnv", env);
                else profile.put("keyringAccount", name + "@" + origin);
                if (ca != null)
                    profile.put("caFile", Path.of(ca).toAbsolutePath().toString());
                if (authOrigin != null)
                    profile.put("authOrigin", origin(authOrigin, loopback).toString());
                PrivateFiles.atomic(home.resolve("profiles.json"), JSON.writeValueAsBytes(cfg));
            }
        }
    }

    public JsonNode get(String name) throws Exception {
        validName(name);
        JsonNode p = config().get(name);
        if (p == null)
            throw CliFailure.input(
                    "Profile is not configured.",
                    "editionctl configure --profile " + name
                            + " --base-url https://control.example.com --token-env EDITION_PAT");
        origin(p.path("baseUrl").asText(), p.path("allowHttpLoopback").asBoolean());
        return p;
    }

    /** 仅核对被选来源的本地存在性；不读取凭据库、不扫描其他变量，也不访问远端。 */
    public ObjectNode inspect(String name) throws Exception {
        var profile = get(name);
        var result = JSON.createObjectNode()
                .put("profile", name)
                .put("baseUrl", profile.path("baseUrl").asText())
                .put("credentialType", profile.path("credentialType").asText())
                .put("authenticationVerified", false)
                .put("authorizationVerified", false);
        var source = result.putObject("source");
        if (profile.has("tokenEnv")) {
            String reference = profile.path("tokenEnv").asText();
            String value = System.getenv(reference);
            source.put("kind", "environment")
                    .put("reference", reference)
                    .put("state", value == null || value.isBlank() ? "missing" : "present");
        } else
            source.put("kind", "os_keyring")
                    .put("reference", profile.path("keyringAccount").asText())
                    .put("state", "not_checked");
        return result;
    }

    public void store(JsonNode profile, String secret) throws Exception {
        if (!profile.has("keyringAccount"))
            throw CliFailure.input(
                    "Profile uses an environment credential.",
                    "Set its configured variable through your secret manager.");
        if (secret.isBlank() || secret.contains("\n") || secret.contains("\r"))
            throw CliFailure.input("Credential must be one nonempty line.", "editionctl config credential set --stdin");
        try (Keyring keyring = Keyring.create()) {
            keyring.setPassword("editionctl", profile.path("keyringAccount").asText(), secret);
        } catch (Exception e) {
            throw CliFailure.credential(
                    "credential_store_unavailable",
                    "System credential store could not save the credential.",
                    "Unlock the OS credential store, or configure --token-env EDITION_PAT for headless use.");
        }
    }

    public String token(JsonNode profile) throws Exception {
        // 系统凭据库不可用就失败；不能为了方便回退到明文配置。
        String secret;
        if (profile.has("tokenEnv"))
            secret = System.getenv(profile.path("tokenEnv").asText());
        else {
            try (Keyring keyring = Keyring.create()) {
                secret = keyring.getPassword(
                        "editionctl", profile.path("keyringAccount").asText());
            } catch (Exception e) {
                throw CliFailure.credential(
                        "credential_store_unavailable",
                        "System credential store is unavailable.",
                        "Unlock the OS credential store, or configure --token-env EDITION_PAT.");
            }
        }
        if (secret == null || secret.isBlank())
            throw CliFailure.credential(
                    "credential_missing",
                    "Configured credential is absent.",
                    profile.has("tokenEnv")
                            ? "Supply the configured environment variable "
                                    + profile.path("tokenEnv").asText()
                                    + " to this process from its designated credential source."
                            : "Import the credential for this profile: editionctl config credential set --stdin.");
        if (secret.indexOf('\r') >= 0 || secret.indexOf('\n') >= 0)
            throw CliFailure.input("Invalid credential line.", "Use a single bearer value.");
        String type = profile.path("credentialType").asText();
        if (type.equals("management_token") && !secret.startsWith("spm_")
                || type.equals("space_token") && !secret.startsWith("spc_"))
            throw CliFailure.credential(
                    "credential_type_mismatch",
                    "Credential does not match its configured type.",
                    "Configure the matching credential type or obtain a management PAT in the console.");
        return secret;
    }

    public static URI origin(String value, boolean loopback) {
        try {
            URI u = URI.create(value);
            boolean local = Set.of("localhost", "127.0.0.1", "[::1]", "::1").contains(u.getHost());
            if (u.getUserInfo() != null
                    || u.getHost() == null
                    || u.getQuery() != null
                    || u.getFragment() != null
                    || !(u.getPath().isEmpty() || u.getPath().equals("/"))
                    || !("https".equals(u.getScheme()) || "http".equals(u.getScheme()) && local && loopback))
                throw new IllegalArgumentException();
            return new URI(u.getScheme(), null, u.getHost().toLowerCase(Locale.ROOT), u.getPort(), null, null, null);
        } catch (Exception e) {
            throw CliFailure.input(
                    "Base URL must be an HTTPS origin without credentials, path, query or fragment.",
                    "editionctl configure --base-url https://control.example.com --token-env EDITION_PAT");
        }
    }

    public static void validName(String name) {
        if (!name.matches("[a-zA-Z0-9_-]{1,64}"))
            throw CliFailure.input("Invalid profile name.", "Use letters, digits, dash or underscore.");
    }
}
