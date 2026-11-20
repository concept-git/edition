package io.space.cli;

import io.space.cli.command.CliApplication;

/** JVM 启动入口。启动脚本和更新后的版本检查都调用这里，返回值成为进程退出码。 */
public final class Main {
    private Main() {}

    public static void main(String[] args) throws Exception {
        // 管道和 Windows 控制台都使用 UTF-8，避免中文被系统代码页替换成问号。
        var output = new java.io.PrintStream(System.out, true, java.nio.charset.StandardCharsets.UTF_8);
        var error = new java.io.PrintStream(System.err, true, java.nio.charset.StandardCharsets.UTF_8);
        try {
            System.exit(new CliApplication(System.in, output, error).execute(args));
        } catch (java.io.IOException failure) {
            output.println(
                    "{\"error\":{\"code\":500,\"reason\":\"contract_unavailable\",\"message\":\"Bundled contract is missing or invalid.\",\"hint\":\"Install a complete trusted distribution.\"}}");
            error.println("Bundled contract is missing or invalid. Install a complete trusted distribution.");
            System.exit(4);
        }
    }
}
