/** 概念模块 ApiToken [Owner, Tenant, Space] —— 规格见本包 CONCEPT.md。 */
@org.springframework.modulith.ApplicationModule(
        id = "concepts.iam.apitoken",
        displayName = "ApiToken",
        allowedDependencies = {"shared"})
package io.edition.control.modules.apitoken;

import io.edition.control.modules.apitoken.api.*;
