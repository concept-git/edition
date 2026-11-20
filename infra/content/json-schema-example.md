# JSON Schema 示例

下面的 Draft 2020-12 Schema 描述文档对象的必填字段、状态取值和标签约束。

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "https://example.com/schemas/document.schema.json",
  "title": "Document",
  "type": "object",
  "properties": {
    "id": {"type": "string", "minLength": 1},
    "title": {"type": "string", "minLength": 1},
    "status": {"enum": ["draft", "published"]},
    "tags": {"type": "array", "items": {"type": "string"}, "uniqueItems": true}
  },
  "required": ["id", "title", "status"],
  "additionalProperties": false
}
```

参考：[JSON Schema Draft 2020-12](https://json-schema.org/draft/2020-12)。
