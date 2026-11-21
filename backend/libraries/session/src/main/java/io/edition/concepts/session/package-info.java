/** 概念模块 Session [Principal] —— 规格见本包 CONCEPT.md。 */
@org.springframework.modulith.ApplicationModule(
        id = "concepts.iam.session",
        displayName = "Session",
        allowedDependencies = {"shared"})
package io.edition.concepts.session;

import io.edition.concepts.session.api.*;
