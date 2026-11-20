package io.space.cli.execution;

import com.fasterxml.jackson.databind.JsonNode;
import io.space.cli.contract.ContractCatalog;
import io.space.cli.shared.CliFailure;
import java.util.*;

/** 发请求前依据响应契约校验 fields；字段裁剪仍由服务端在授权之后执行。 */
final class ResponseFields {
    private final ContractCatalog catalog;
    private final String mask;
    private int position;
    private int fields;
    private boolean cursor;

    private ResponseFields(ContractCatalog catalog, String mask) {
        this.catalog = catalog;
        this.mask = mask;
    }

    static void validate(ContractCatalog catalog, JsonNode op, String mask, boolean pagination) {
        if (mask.equals("*")) return;
        JsonNode response = null;
        for (var entries = op.path("responses").properties().iterator(); entries.hasNext(); ) {
            var entry = entries.next();
            if (entry.getKey().startsWith("2"))
                for (var content : entry.getValue().path("content"))
                    if (content.has("schema")) {
                        response = content.path("schema");
                        break;
                    }
            if (response != null) break;
        }
        if (response == null) throw invalid();
        var parser = new ResponseFields(catalog, mask);
        if (mask.isEmpty() || mask.length() > 4096) throw invalid();
        parser.list(response, 0, true);
        if (parser.position != mask.length()) throw invalid();
        if (pagination && !parser.cursor)
            throw CliFailure.input(
                    "Pagination field mask must include nextCursor.",
                    "Use --params '{\"fields\":\"items(id),nextCursor\",...}' with the target parameters.");
    }

    private void list(JsonNode parent, int depth, boolean top) {
        if (depth > 16) throw invalid();
        do {
            JsonNode current = parent;
            int pathDepth = depth;
            boolean root = top;
            while (true) {
                current = object(current);
                int start = position;
                while (position < mask.length()
                        && (Character.isLetterOrDigit(mask.charAt(position))
                                || mask.charAt(position) == '_'
                                || mask.charAt(position) == '*')) position++;
                String name = mask.substring(start, position);
                if (name.isEmpty() || name.contains("*") && !name.equals("*") || ++fields > 256) throw invalid();
                if (root && (name.equals("nextCursor") || name.equals("*"))) cursor = true;
                if (name.equals("*")) {
                    if (position < mask.length() && (mask.charAt(position) == '/' || mask.charAt(position) == '('))
                        throw invalid();
                } else {
                    current = current.path("properties").path(name);
                    if (current.isMissingNode()) throw invalid();
                }
                if (!take('/')) break;
                if (++pathDepth > 16) throw invalid();
                root = false;
            }
            if (take('(')) {
                list(current, pathDepth + 1, false);
                if (!take(')')) throw invalid();
            }
        } while (take(','));
    }

    private JsonNode object(JsonNode input) {
        JsonNode current = input;
        for (int depth = 0; depth < 32; depth++) {
            if (current.has("$ref")) current = catalog.resolve(current);
            else if (current.has("anyOf")) current = current.path("anyOf").get(0);
            else if (current.path("type").asText().equals("array")) current = current.path("items");
            else {
                if (!current.path("properties").isObject()) throw invalid();
                return current;
            }
        }
        throw invalid();
    }

    private boolean take(char ch) {
        if (position == mask.length() || mask.charAt(position) != ch) return false;
        position++;
        return true;
    }

    private static CliFailure invalid() {
        return CliFailure.input(
                "Invalid or unknown response field mask.",
                "Inspect the response type with spacectl schema; use comma, slash or subselectors and select dynamic maps whole.");
    }
}
