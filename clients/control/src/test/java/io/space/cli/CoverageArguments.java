package io.space.cli;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

/** Keep real child-JVM executions in the same coverage evidence as in-process unit tests. */
public final class CoverageArguments {
    private CoverageArguments() {}

    public static String[] jvm(String... arguments) {
        var result = new ArrayList<String>();
        String agent = System.getProperty("space.test.coverage.arg");
        if (agent != null) result.add(agent);
        result.addAll(Arrays.asList(arguments));
        return result.toArray(String[]::new);
    }

    public static void instrument(List<String> command) {
        String agent = System.getProperty("space.test.coverage.arg");
        if (agent != null) command.add(1, agent);
    }
}
