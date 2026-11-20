package io.space.cli.command;

import io.space.cli.execution.ControlCall;
import io.space.cli.shared.BuildInfo;
import io.space.cli.shared.CliFailure;
import java.util.*;
import org.aesh.command.Command;
import org.aesh.command.CommandException;
import org.aesh.command.CommandResult;
import org.aesh.command.impl.internal.*;
import org.aesh.command.impl.invocation.AeshInvocationProviders;
import org.aesh.command.impl.parser.AeshCommandLineParser;
import org.aesh.command.impl.parser.CommandLineParser.Mode;
import org.aesh.command.invocation.CommandInvocation;
import org.aesh.command.operator.OperatorType;
import org.aesh.command.parser.*;
import org.aesh.console.DefaultAeshContext;
import org.aesh.parser.*;

/** Aesh 管语法与类型转换；此适配器连接执行器、脱敏失败与命令示例。 */
final class CliCommand extends AeshCommandLineParser<CommandInvocation> {
    @FunctionalInterface
    interface Action {
        void run() throws Exception;
    }

    final String qualifiedName;
    private final CliCommand parent;
    private List<String> examples = List.of();

    CliCommand(String name, String description, Action action) throws CommandLineParserException {
        this(null, name, description, action);
    }

    private CliCommand(CliCommand parent, String name, String description, Action action)
            throws CommandLineParserException {
        super(ProcessedCommandBuilder.<Command<CommandInvocation>, CommandInvocation>builder()
                .name(name)
                .description(description)
                .generateHelp(true)
                .version("spacectl " + BuildInfo.VERSION)
                .command(command(action, parent == null ? name : parent.qualifiedName + " " + name))
                .create());
        this.parent = parent;
        qualifiedName = parent == null ? name : parent.qualifiedName + " " + name;
        updateAnsiMode(false);
    }

    CliCommand add(String name, String description, Action action) throws CommandLineParserException {
        var child = new CliCommand(this, name, description, action);
        addChildParser(child);
        return child;
    }

    CliCommand child(String name) {
        return (CliCommand) getChildParser(name);
    }

    CliCommand path(String dotted, String description, Action action) throws CommandLineParserException {
        var current = this;
        var parts = dotted.split("\\.");
        for (int i = 0; i < parts.length; i++) {
            boolean leaf = i == parts.length - 1;
            var child = current.child(parts[i]);
            if (child == null) child = current.add(parts[i], leaf ? description : "", leaf ? action : null);
            current = child;
        }
        return current;
    }

    ProcessedOption option(String name, Class<?> type, String description) throws OptionParserException {
        var option = ProcessedOptionBuilder.builder()
                .name(name)
                .type(type)
                .hasValue(type != Boolean.class && type != boolean.class)
                .description(description)
                .build();
        option.updateAnsiMode(false);
        getProcessedCommand().addOption(option);
        return option;
    }

    void argument(String label, String description) throws OptionParserException {
        getProcessedCommand()
                .setArgument(ProcessedOptionBuilder.builder()
                        .name("target")
                        .type(String.class)
                        .optionType(OptionType.ARGUMENT)
                        .index("0")
                        .arity("1")
                        .required(true)
                        .paramLabel(label)
                        .description(description)
                        .build());
    }

    void examples(String... values) {
        examples = List.of(values);
    }

    List<String> examples() {
        if (!examples.isEmpty()) return examples;
        var children = getAllChildParsers();
        return List.of(qualifiedName + " "
                + (children.isEmpty()
                        ? "--help"
                        : children.getFirst().getProcessedCommand().name() + " --help"));
    }

    List<ProcessedOption> options() {
        var options = new ArrayList<>(getProcessedCommand().getOptions());
        for (var command = parent; command != null; command = command.parent)
            command.getProcessedCommand().getOptions().stream()
                    .filter(ProcessedOption::isInherited)
                    .forEach(options::add);
        return options;
    }

    int execute(ControlCall context, String[] args) {
        CliCommand selected = this;
        try {
            // Preserve argv tokens, including empty strings, JSON quotes and shell-looking body text.
            var words = new ArrayList<ParsedWord>();
            words.add(new ParsedWord(getProcessedCommand().name(), 0));
            int offset = qualifiedName.length() + 1;
            for (String arg : args) {
                words.add(new ParsedWord(arg, offset));
                offset += arg.length() + 1;
            }
            var line = new ParsedLine("", words, -1, -1, -1, ParserStatus.OK, "", OperatorType.NONE);
            parse(line.iterator(), Mode.STRICT);
            selected = parsed();
            context.command = selected.qualifiedName.replaceFirst("^spacectl ?", "");
            var providers = new AeshInvocationProviders();
            var aeshContext = DefaultAeshContext.getDefault();
            boolean help = false, version = false;
            for (var command = selected; command != null; command = command.parent) {
                help |= command.getProcessedCommand().isGenerateHelpOptionSet();
                version |= command.getProcessedCommand().isGenerateVersionOptionSet();
                for (var option : command.getProcessedCommand().getOptions()) {
                    if (option.getValues().size() > 1) throw new OptionParserException("Repeated option.");
                    if (option.getValue() == null
                            || option.name().equals("help")
                            || option.name().equals("version")) continue;
                    Object value = option.doConvert(option.getValue(), providers, null, aeshContext, true);
                    context.options.put(option.name(), String.valueOf(value));
                }
            }
            for (var command = selected; command != null; command = command.parent)
                for (var error : command.getProcessedCommand().parserExceptions())
                    if (!(error instanceof RequiredOptionException && (help || version))) throw error;
            if (help) {
                context.output.print(selected.printHelp());
                context.output.println("\nExamples:");
                selected.examples().forEach(example -> context.output.println("  " + example));
                return 0;
            }
            if (version) {
                context.output.println(selected.getProcessedCommand().version());
                return 0;
            }
            var argument = selected.getProcessedCommand().getArgument();
            if (argument != null && argument.getValue() != null) context.options.put("target", argument.getValue());
        } catch (Exception error) {
            return context.fail(
                    CliFailure.input("Invalid command option or value.", selected.qualifiedName + " --help"));
        }
        try {
            selected.getCommand().execute(null);
            return 0;
        } catch (Exception error) {
            if (error instanceof CommandException && error.getCause() instanceof Exception cause)
                return context.fail(cause);
            return context.fail(error);
        }
    }

    private static Command<CommandInvocation> command(Action action, String name) {
        return invocation -> {
            if (action == null) throw CliFailure.input("Supply a command method.", name + " --help");
            try {
                action.run();
                return CommandResult.SUCCESS;
            } catch (Exception error) {
                throw new CommandException(error);
            }
        };
    }

    private CliCommand parsed() {
        for (var child : getAllChildParsers())
            if (child.getProcessedCommand().isDirty()) return ((CliCommand) child).parsed();
        return this;
    }
}
