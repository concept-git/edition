/** 概念模块 Password [User] —— 规格见本包 CONCEPT.md；类型参数落为不透明 id，不引入对方类型。 */
@org.springframework.modulith.ApplicationModule(
        id = "concepts.iam.password",
        displayName = "Password",
        allowedDependencies = {"shared"})
package io.edition.concepts.password;

import io.edition.concepts.password.api.*;
