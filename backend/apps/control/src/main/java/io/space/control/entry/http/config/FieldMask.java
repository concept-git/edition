package io.space.control.entry.http.config;

import io.space.control.compositions.flow.ProblemCode;
import io.space.control.entry.http.problem.GatewayProblemException;
import io.space.shared.ValidationViolation;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import tools.jackson.databind.JavaType;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.json.JsonMapper;

/** Bounded Google-style field selection; authorization has already produced the source value. */
final class FieldMask {
    private static final class Selection {
        boolean whole;
        final Map<String, Selection> fields = new LinkedHashMap<>();
    }

    private final String expression;
    private int position;
    private int nodes;
    private final Selection root = new Selection();

    FieldMask(String expression) {
        this.expression = expression;
        if (expression.isEmpty() || expression.length() > 4096) throw invalid();
        list(root, 0);
        if (position != expression.length()) throw invalid();
    }

    private void list(Selection parent, int depth) {
        if (depth > 16) throw invalid();
        do {
            Selection current = parent;
            int pathDepth = depth;
            while (true) {
                int start = position;
                while (position < expression.length()
                        && (Character.isLetterOrDigit(expression.charAt(position))
                                || expression.charAt(position) == '_'
                                || expression.charAt(position) == '*')) position++;
                String name = expression.substring(start, position);
                if (name.isEmpty() || name.contains("*") && !name.equals("*") || ++nodes > 256) throw invalid();
                current = current.fields.computeIfAbsent(name, key -> new Selection());
                if (!take('/')) break;
                if (name.equals("*") || ++pathDepth > 16) throw invalid();
            }
            if (take('(')) {
                list(current, pathDepth + 1);
                if (!take(')')) throw invalid();
            } else current.whole = true;
        } while (take(','));
    }

    private boolean take(char token) {
        if (position == expression.length() || expression.charAt(position) != token) return false;
        position++;
        return true;
    }

    void validate(JavaType type, JsonMapper mapper) {
        validate(root, type, mapper);
    }

    private void validate(Selection selection, JavaType type, JsonMapper mapper) {
        if (selection.whole) return;
        if (selection.fields.size() == 1 && selection.fields.containsKey("*") && selection.fields.get("*").whole)
            return;
        if (type.isCollectionLikeType() || type.isArrayType()) {
            validate(selection, type.getContentType(), mapper);
            return;
        }
        if (type.isMapLikeType()
                || type.isPrimitive()
                || type.getRawClass().getName().startsWith("java.")) throw invalid();
        var config = mapper.serializationConfig();
        var introspector = config.classIntrospectorInstance().forOperation(config);
        var properties = introspector
                .introspectForSerialization(type, introspector.introspectClassAnnotations(type))
                .findProperties();
        for (var entry : selection.fields.entrySet()) {
            if (entry.getKey().equals("*") && entry.getValue().whole) continue;
            var property = properties.stream()
                    .filter(p -> p.getName().equals(entry.getKey()))
                    .findFirst()
                    .orElseThrow(FieldMask::invalid);
            validate(entry.getValue(), property.getPrimaryType(), mapper);
        }
    }

    JsonNode project(JsonNode value, JsonMapper mapper) {
        return project(root, value, mapper);
    }

    private JsonNode project(Selection selection, JsonNode value, JsonMapper mapper) {
        if (selection.whole || value.isNull() || selection.fields.containsKey("*")) return value;
        if (value.isArray()) {
            var result = mapper.createArrayNode();
            value.forEach(item -> result.add(project(selection, item, mapper)));
            return result;
        }
        if (!value.isObject()) throw invalid();
        var result = mapper.createObjectNode();
        selection.fields.forEach((name, child) -> {
            if (value.has(name)) result.set(name, project(child, value.get(name), mapper));
        });
        return result;
    }

    private static GatewayProblemException invalid() {
        return new GatewayProblemException(
                ProblemCode.VALIDATION_FAILED, List.of(new ValidationViolation("fields", "invalid_field_mask"))) {};
    }
}
