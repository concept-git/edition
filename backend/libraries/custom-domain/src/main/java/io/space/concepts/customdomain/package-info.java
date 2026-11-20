/** 概念模块 CustomDomain [Target] —— 规格见本包 CONCEPT.md；TLS 属实现层（Caddy on-demand）。 */
@org.springframework.modulith.ApplicationModule(
        id = "concepts.hosting.customdomain",
        displayName = "CustomDomain",
        allowedDependencies = {"shared"})
package io.space.concepts.customdomain;

import io.space.concepts.customdomain.api.*;
