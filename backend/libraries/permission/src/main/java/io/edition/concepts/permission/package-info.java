/** 概念模块 Permission [Resource, Principal] —— 规格见本包 CONCEPT.md；资源链一律稳定 id。 */
@org.springframework.modulith.ApplicationModule(
        id = "concepts.iam.permission",
        displayName = "Permission",
        allowedDependencies = {"shared"})
package io.edition.concepts.permission;

import io.edition.concepts.permission.api.*;
