package io.edition.concepts.importformat.markdown;

import io.edition.concepts.importformat.api.*;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import org.yaml.snakeyaml.LoaderOptions;
import org.yaml.snakeyaml.Yaml;
import org.yaml.snakeyaml.constructor.SafeConstructor;
import org.yaml.snakeyaml.error.YAMLException;

/** 只解析 YAML 语法；字段意义由来源格式解释，非法 YAML 保留原文。 */
public final class FrontMatter {
    private static final Pattern CLOSING = Pattern.compile("(?m)^---\\s*$");

    private FrontMatter() {}

    public record Parsed(Map<String, Object> data, String body) {}

    public static Parsed parse(String text) {
        String source = text.startsWith("\uFEFF") ? text.substring(1) : text;
        if (!source.startsWith("---")) return new Parsed(Map.of(), source);
        Matcher closing = CLOSING.matcher(source);
        if (!closing.find(3)) return new Parsed(Map.of(), source);
        String yamlText = source.substring(indexAfterFirstLine(source), closing.start());
        String body = source.substring(closing.end());
        if (body.startsWith("\r\n")) body = body.substring(2);
        else if (body.startsWith("\n")) body = body.substring(1);
        try {
            Yaml yaml = new Yaml(new SafeConstructor(new LoaderOptions()));
            Object loaded = yaml.load(yamlText);
            if (loaded instanceof Map<?, ?> map) {
                Map<String, Object> data = new LinkedHashMap<>();
                for (var entry : map.entrySet()) {
                    if (entry.getKey() != null) data.put(String.valueOf(entry.getKey()), entry.getValue());
                }
                return new Parsed(data, body);
            }
            return new Parsed(Map.of(), body);
        } catch (YAMLException ignored) {
            return new Parsed(Map.of(), source);
        }
    }

    private static int indexAfterFirstLine(String source) {
        int nl = source.indexOf('\n');
        return nl < 0 ? source.length() : nl + 1;
    }
}
