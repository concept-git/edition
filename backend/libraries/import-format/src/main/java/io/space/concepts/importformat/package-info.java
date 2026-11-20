/**
 * 平台概念 ImportFormat（规格见 CONCEPT.md）：把外来 zip 嗅探并适配为 Bundle v1 形状。
 * 其他概念模块与 gateway 不得依赖；只有 sync 可经 {@link io.space.concepts.importformat.api.ImportFormatApi} 使用。
 */
@org.springframework.modulith.ApplicationModule(
        id = "platform.importformat",
        displayName = "ImportFormat",
        allowedDependencies = {"shared"})
package io.space.concepts.importformat;

import io.space.concepts.importformat.api.*;
