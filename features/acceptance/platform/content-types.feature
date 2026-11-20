# language: zh-CN
# 规格依据: backend/apps/control/src/main/java/io/space/control/compositions/platform/contenttype/SYNCS.md
# 规格依据: backend/apps/control/src/main/java/io/space/control/compositions/authoring/pageediting/SYNCS.md
# 规格依据: backend/apps/control/src/main/java/io/space/control/compositions/releases/release/SYNCS.md
# 规格依据: backend/apps/content/src/main/java/io/space/contentapp/SYNCS.md
@area-platform @suite-console
@content-plugins @content-types
功能: 内容类型编辑与独立交付
  @case-content-types-001
  场景: 七类内容保存后重开并由独立 Reader 有效呈现
    当 作者在真实站点逐一编辑保存并进版七类内容
    那么 独立 Reader 呈现七类内容并支持 Schema 样例与 A2UI 数据绑定
