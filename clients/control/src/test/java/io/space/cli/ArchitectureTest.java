package io.space.cli;

import static org.junit.jupiter.api.Assertions.*;

import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.*;
import java.util.concurrent.*;
import java.util.regex.Pattern;
import org.junit.jupiter.api.Test;

/** Check actual bytecode dependencies, including method bodies, rather than source imports. */
class ArchitectureTest {
    private static final String PREFIX = "io.space.cli.";

    @Test
    void packageDependenciesRespectStateAndCredentialOwnership() throws Exception {
        Path classes = Path.of(
                Main.class.getProtectionDomain().getCodeSource().getLocation().toURI());
        var process = new ProcessBuilder(
                        Path.of(System.getProperty("java.home"), "bin", "jdeps").toString(),
                        "--ignore-missing-deps",
                        "-verbose:class",
                        "-filter:none",
                        classes.toString())
                .redirectErrorStream(true)
                .start();
        var output = CompletableFuture.supplyAsync(() -> {
            try {
                return new String(process.getInputStream().readAllBytes(), StandardCharsets.UTF_8);
            } catch (Exception e) {
                throw new CompletionException(e);
            }
        });
        if (!process.waitFor(30, TimeUnit.SECONDS)) {
            process.destroyForcibly();
            fail("Dependency inspection timed out");
        }
        String dependencies = output.get();
        assertEquals(0, process.exitValue(), dependencies);
        var allowed = Map.of(
                "Main", Set.of("command"),
                "command", Set.of("command", "execution", "contract", "update", "state", "shared"),
                "execution", Set.of("execution", "contract", "state", "shared"),
                "contract", Set.of("contract", "shared"),
                "update", Set.of("update", "shared"),
                "state", Set.of("state", "shared"),
                "shared", Set.of("shared"));
        var externalOwners = Map.of(
                "org.aesh.", "command",
                "io.modelcontextprotocol.", "command",
                "com.networknt.schema.", "execution",
                "com.github.javakeyring.", "state");
        var productionClasses = new HashSet<String>();
        try (var files = Files.walk(classes.resolve("io/space/cli"))) {
            files.filter(file -> file.toString().endsWith(".class")).forEach(file -> {
                String name = classes.relativize(file).toString().replace('\\', '/');
                productionClasses.add(
                        name.substring(0, name.length() - ".class".length()).replace('/', '.'));
            });
        }
        assertFalse(productionClasses.isEmpty(), "No production classes were found");
        var modules = new HashSet<String>();
        for (String name : productionClasses) modules.add(module(name));
        assertEquals(allowed.keySet(), modules, "Production modules differ from the architecture rules");

        var edges = Pattern.compile("(?m)^\\s*(io\\.space\\.cli\\.[\\w.$]+)\\s+->\\s+([\\w.$]+)")
                .matcher(dependencies);
        var inspected = new HashSet<String>();
        while (edges.find()) {
            String source = edges.group(1), target = edges.group(2);
            inspected.add(source);
            String sourceModule = module(source);
            assertTrue(allowed.containsKey(sourceModule), "Unknown production module: " + source);
            if (target.startsWith(PREFIX)) {
                String targetModule = module(target);
                assertTrue(allowed.get(sourceModule).contains(targetModule), source + " -> " + target);
                if (sourceModule.equals("command") && targetModule.equals("execution"))
                    assertTrue(
                            target.equals(PREFIX + "execution.ControlCall")
                                    || target.startsWith(PREFIX + "execution.ControlCall$"),
                            "Adapters must use the execution facade: " + source + " -> " + target);
            } else if (!target.startsWith("java.")
                    && !target.startsWith("javax.")
                    && !target.startsWith("com.fasterxml.jackson.")) {
                var owner = externalOwners.entrySet().stream()
                        .filter(entry -> target.startsWith(entry.getKey()))
                        .map(Map.Entry::getValue)
                        .findFirst();
                assertTrue(owner.isPresent(), "Undeclared external dependency: " + source + " -> " + target);
                assertEquals(owner.get(), sourceModule, source + " -> " + target);
            }
            if (source.equals(PREFIX + "shared.HttpClients") || source.startsWith(PREFIX + "shared.HttpClients$"))
                assertFalse(target.startsWith("com.fasterxml.jackson."), source + " -> " + target);
        }
        assertEquals(productionClasses, inspected, "jdeps did not inspect every production class");
    }

    private static String module(String className) {
        String name = className.substring(PREFIX.length()).split("\\.")[0];
        return name.startsWith("Main$") ? "Main" : name;
    }
}
