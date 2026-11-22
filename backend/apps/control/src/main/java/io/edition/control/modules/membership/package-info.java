/** 概念模块 Membership [Group, Member] —— 规格见本包 CONCEPT.md；tenant/team 两次实例化共此一模块。 */
@org.springframework.modulith.ApplicationModule(
        id = "concepts.iam.membership",
        displayName = "Membership",
        allowedDependencies = {"shared"})
package io.edition.control.modules.membership;

import io.edition.control.modules.membership.api.*;
