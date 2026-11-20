package io.space.cli.command;

import io.space.cli.contract.ContractCatalog;
import io.space.cli.execution.ControlCall;
import java.io.*;

/** 管理一次 CLI 调用：创建上下文、解析命令、执行并报告失败；异常中不回显用户输入。 */
public final class CliApplication {
    final ContractCatalog catalog;
    private final InputStream input;
    private final PrintStream output;
    private final PrintStream error;

    public CliApplication(InputStream input, PrintStream output, PrintStream error) throws Exception {
        this.input = input;
        this.output = output;
        this.error = error;
        catalog = new ContractCatalog();
    }

    public int execute(String... args) {
        // 每次调用独立保存选项和状态，批量或长驻进程不会串用上一次的参数。
        var context = new ControlCall(
                catalog, input, output, error, () -> io.space.cli.update.ReleaseUpdater.background(error));
        try {
            return new CommandTree(context).execute(args);
        } catch (Exception failure) {
            return context.fail(failure);
        }
    }
}
