package io.edition.control.modules.importjob;

import io.edition.control.modules.importjob.api.*;

/** Construction entry; production imports belong to application bootstrap. */
@org.springframework.context.annotation.Configuration(proxyBeanMethods = false)
@org.springframework.context.annotation.ComponentScan(basePackages = "io.edition.control.modules.importjob")
@org.mybatis.spring.annotation.MapperScan("io.edition.control.modules.importjob.persistence")
public class ImportJobConfiguration {}
