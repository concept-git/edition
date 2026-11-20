/** 概念模块 ApiToken [Owner, Tenant, Space] —— 规格见本包 CONCEPT.md。 */
@org.springframework.modulith.ApplicationModule(
        id = "concepts.iam.apitoken",
        displayName = "ApiToken",
        allowedDependencies = {"shared"})
package io.space.concepts.apitoken;

import io.space.concepts.apitoken.api.*;
