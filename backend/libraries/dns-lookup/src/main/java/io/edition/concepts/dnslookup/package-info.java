/**
 * 平台概念 DnsLookup（规格见 CONCEPT.md）：权威 TXT 查询。其他概念模块不得依赖；只有 sync 经 DnsLookupApi 使用。
 */
@org.springframework.modulith.ApplicationModule(
        id = "platform.dnslookup",
        displayName = "DnsLookup",
        allowedDependencies = {"shared"})
package io.edition.concepts.dnslookup;

import io.edition.concepts.dnslookup.api.*;
