/** 概念模块 Collection [Item] —— 规格见本包 CONCEPT.md；只管归类，不承载权限/地址/生命周期。 */
@org.springframework.modulith.ApplicationModule(
        id = "concepts.authoring.collection",
        displayName = "Collection",
        allowedDependencies = {"shared"})
package io.space.concepts.collection;

import io.space.concepts.collection.api.*;
