package io.space.concepts.importjob.adapters;

import io.space.concepts.importjob.api.*;

/** Construction entry; production imports belong to application bootstrap. */
@org.springframework.context.annotation.Configuration(proxyBeanMethods = false)
@org.springframework.context.annotation.ComponentScan(basePackages = "io.space.concepts.importjob")
@org.mybatis.spring.annotation.MapperScan("io.space.concepts.importjob.adapters.persistence")
public class ImportJobConfiguration {}
