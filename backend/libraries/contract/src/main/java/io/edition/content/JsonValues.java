package io.edition.content;

import java.util.*;

/** Passive JSON value copying and deterministic identity material; no JSON parser or I/O. */
public final class JsonValues {
    private JsonValues() {}

    public static Map<String, Object> object(Map<String, ?> source) {
        if (source == null) return Map.of();
        // Count the root object before copying its children, just as copy() does for nested maps.
        return copyObject(source, 0, new int[] {1});
    }

    private static Object copy(Object value, int depth, int[] count) {
        if (++count[0] > 20000 || depth > 64) throw new IllegalArgumentException("JSON structure exceeds limits");
        if (value == null || value instanceof String || value instanceof Boolean) return value;
        if (value instanceof Number number) {
            if (!Double.isFinite(number.doubleValue())) throw new IllegalArgumentException("Non-finite JSON number");
            return value;
        }
        if (value instanceof Map<?, ?> map) {
            return copyObject(map, depth, count);
        }
        if (value instanceof List<?> list) {
            var result = new ArrayList<Object>();
            for (var item : list) result.add(copy(item, depth + 1, count));
            return Collections.unmodifiableList(result);
        }
        throw new IllegalArgumentException("Only JSON values are supported");
    }

    private static Map<String, Object> copyObject(Map<?, ?> map, int depth, int[] count) {
        var result = new TreeMap<String, Object>();
        for (var entry : map.entrySet()) {
            if (!(entry.getKey() instanceof String key))
                throw new IllegalArgumentException("JSON object keys must be strings");
            result.put(key, copy(entry.getValue(), depth + 1, count));
        }
        return Collections.unmodifiableMap(result);
    }

    public static String canonical(Object value) {
        if (value == null) return "n";
        if (value instanceof String s) return "s" + s.length() + ":" + s;
        if (value instanceof Boolean b) return b ? "t" : "f";
        if (value instanceof Number n)
            return "d"
                    + new java.math.BigDecimal(n.toString())
                            .stripTrailingZeros()
                            .toPlainString() + ";";
        var out = new StringBuilder();
        if (value instanceof Map<?, ?> map) {
            out.append('{');
            for (var key :
                    new TreeSet<>(map.keySet().stream().map(Object::toString).toList()))
                out.append(canonical(key)).append(canonical(map.get(key)));
            return out.append('}').toString();
        }
        if (value instanceof List<?> list) {
            out.append('[');
            for (var item : list) out.append(canonical(item));
            return out.append(']').toString();
        }
        throw new IllegalArgumentException("Only JSON values are supported");
    }
}
