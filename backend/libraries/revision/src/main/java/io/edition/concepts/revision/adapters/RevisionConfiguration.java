package io.edition.concepts.revision.adapters;

import io.edition.concepts.revision.api.*;

/** Construction entry; production imports belong to application bootstrap. */
@org.springframework.context.annotation.Configuration(proxyBeanMethods = false)
@org.springframework.context.annotation.ComponentScan(basePackages = "io.edition.concepts.revision")
@org.mybatis.spring.annotation.MapperScan("io.edition.concepts.revision.adapters.persistence")
public class RevisionConfiguration {}
