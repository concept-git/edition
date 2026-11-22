/** 概念模块 CustomDomain [Target] —— 规格见本包 CONCEPT.md；TLS 属实现层（Caddy on-demand）。 */
@org.springframework.modulith.ApplicationModule(
        id = "concepts.hosting.customdomain",
        displayName = "CustomDomain",
        allowedDependencies = {"shared"})
package io.edition.control.modules.customdomain;

import io.edition.control.modules.customdomain.api.*;
