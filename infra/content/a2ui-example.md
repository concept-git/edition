# Google A2UI 示例

下面的 `createSurface` 消息依据 A2UI v1.0 协议组织组件与数据：`components` 定义界面结构，`dataModel` 提供界面读取的值。

```json
{
  "version": "v1.0",
  "createSurface": {
    "surfaceId": "document_preview",
    "catalogId": "https://a2ui.org/specification/v1_0/catalogs/basic/catalog.json",
    "components": [
      {"id": "root", "component": "Column", "children": ["heading", "status"]},
      {"id": "heading", "component": "Text", "text": {"path": "/title"}},
      {"id": "status", "component": "Text", "text": {"path": "/status"}}
    ],
    "dataModel": {"title": "快速开始", "status": "已发布"}
  }
}
```

参考：[A2UI v1.0 协议](https://github.com/a2ui-project/a2ui/blob/main/specification/v1_0/docs/a2ui_protocol.md)。
