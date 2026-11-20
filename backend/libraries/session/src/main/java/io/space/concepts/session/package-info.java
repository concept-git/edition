/** 概念模块 Session [Principal] —— 规格见本包 CONCEPT.md。 */
@org.springframework.modulith.ApplicationModule(
        id = "concepts.iam.session",
        displayName = "Session",
        allowedDependencies = {"shared"})
package io.space.concepts.session;

import io.space.concepts.session.api.*;
