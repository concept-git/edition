package io.edition.control.modules.revision;

import io.edition.control.modules.revision.api.*;

/** Construction entry; production imports belong to application bootstrap. */
@org.springframework.context.annotation.Configuration(proxyBeanMethods = false)
@org.springframework.context.annotation.ComponentScan(basePackages = "io.edition.control.modules.revision")
@org.mybatis.spring.annotation.MapperScan("io.edition.control.modules.revision.persistence")
public class RevisionConfiguration {}
