/**
 * 平台概念 Idempotency（规格见 CONCEPT.md），拥有 shared.idempotency_records。
 * sync 可依赖；gateway 与其他概念模块不可直接依赖。
 */
@org.springframework.modulith.ApplicationModule(
        id = "platform.idempotency",
        displayName = "Idempotency",
        allowedDependencies = {"shared"})
package io.edition.control.modules.idempotency;

import io.edition.control.modules.idempotency.api.*;
