package io.edition.concepts.importjob.adapters;

import io.edition.concepts.importjob.api.*;

/** Construction entry; production imports belong to application bootstrap. */
@org.springframework.context.annotation.Configuration(proxyBeanMethods = false)
@org.springframework.context.annotation.ComponentScan(basePackages = "io.edition.concepts.importjob")
@org.mybatis.spring.annotation.MapperScan("io.edition.concepts.importjob.adapters.persistence")
public class ImportJobConfiguration {}
