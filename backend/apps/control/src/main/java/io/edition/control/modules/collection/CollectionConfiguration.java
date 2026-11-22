package io.edition.control.modules.collection;

import io.edition.control.modules.collection.api.*;

/** Construction entry; production imports belong to application bootstrap. */
@org.springframework.context.annotation.Configuration(proxyBeanMethods = false)
@org.springframework.context.annotation.ComponentScan(basePackages = "io.edition.control.modules.collection")
@org.mybatis.spring.annotation.MapperScan("io.edition.control.modules.collection.persistence")
public class CollectionConfiguration {}
