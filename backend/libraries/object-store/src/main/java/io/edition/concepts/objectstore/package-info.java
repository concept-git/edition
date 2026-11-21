/**
 * 平台概念 ObjectStore（规格见 CONCEPT.md）：内容寻址的二进制对象存储出口。
 * 其他概念模块不得依赖；只有 sync 可经 {@link io.edition.concepts.objectstore.api.ObjectStoreApi} 使用。
 */
@org.springframework.modulith.ApplicationModule(
        id = "platform.objectstore",
        displayName = "ObjectStore",
        allowedDependencies = {"shared"})
package io.edition.concepts.objectstore;

import io.edition.concepts.objectstore.api.*;
