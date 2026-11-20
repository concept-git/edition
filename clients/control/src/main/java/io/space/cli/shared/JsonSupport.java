package io.space.cli.shared;

import com.fasterxml.jackson.databind.*;
import java.nio.charset.StandardCharsets;
import java.nio.file.*;
import java.security.MessageDigest;
import java.util.*;

/** 严格 JSON 与稳定哈希工具：拒绝重复字段，按键排序，让相同请求得到相同指纹。 */
public final class JsonSupport {
    public static final ObjectMapper JSON = new ObjectMapper()
            .enable(SerializationFeature.ORDER_MAP_ENTRIES_BY_KEYS)
            .enable(com.fasterxml.jackson.core.JsonParser.Feature.STRICT_DUPLICATE_DETECTION)
            .enable(DeserializationFeature.FAIL_ON_TRAILING_TOKENS);

    private JsonSupport() {}

    /** 秘密叶子按字段名识别；token 元数据对象保留 ID/scope，再检查其中的秘密字段。 */
    public static boolean secretField(String name, JsonNode value) {
        return name.matches("(?i).*(password|secret|token|putUrl|uploadUrl)$") && !value.isObject();
    }

    public static JsonNode canonical(JsonNode node) {
        if (node.isObject()) {
            var out = JSON.createObjectNode();
            var names = new TreeSet<String>();
            node.fieldNames().forEachRemaining(names::add);
            for (String n : names) out.set(n, canonical(node.get(n)));
            return out;
        }
        if (node.isArray()) {
            var out = JSON.createArrayNode();
            for (var n : node) out.add(canonical(n));
            return out;
        }
        return node;
    }

    public static String hash(String text) throws Exception {
        return HexFormat.of()
                .formatHex(MessageDigest.getInstance("SHA-256").digest(text.getBytes(StandardCharsets.UTF_8)));
    }

    public static String hashFile(Path path) throws Exception {
        var digest = MessageDigest.getInstance("SHA-256");
        try (var stream = Files.newInputStream(path)) {
            byte[] b = new byte[65536];
            int n;
            while ((n = stream.read(b)) != -1) digest.update(b, 0, n);
        }
        return HexFormat.of().formatHex(digest.digest());
    }
}
