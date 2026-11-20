package io.space.cli.shared;

import static io.space.cli.shared.JsonSupport.JSON;

import java.io.IOException;

/** 发行物身份只来自构建标记，命令入口与更新模块共用同一版本。 */
public final class BuildInfo {
    public static final String VERSION = version();

    private BuildInfo() {}

    private static String version() {
        try (var source = BuildInfo.class.getResourceAsStream("/release.json")) {
            if (source == null) throw new IOException("Build version marker is absent.");
            String version = JSON.readTree(source).path("version").asText();
            if (!version.matches("[0-9]{1,6}\\.[0-9]{1,6}\\.[0-9]{1,6}"))
                throw new IOException("Build version marker is invalid.");
            return version;
        } catch (IOException e) {
            throw new ExceptionInInitializerError(e);
        }
    }
}
