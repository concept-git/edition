package io.edition.concepts.certificateinspection.adapters;

import io.edition.concepts.certificateinspection.api.*;

/** Construction entry; production imports belong to application bootstrap. */
@org.springframework.context.annotation.Configuration(proxyBeanMethods = false)
@org.springframework.context.annotation.ComponentScan(basePackages = "io.edition.concepts.certificateinspection")
public class CertificateInspectionConfiguration {}
