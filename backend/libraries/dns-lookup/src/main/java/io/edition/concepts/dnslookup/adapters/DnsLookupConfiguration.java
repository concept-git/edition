package io.edition.concepts.dnslookup.adapters;

import io.edition.concepts.dnslookup.api.*;

/** Construction entry; production imports belong to application bootstrap. */
@org.springframework.context.annotation.Configuration(proxyBeanMethods = false)
@org.springframework.context.annotation.ComponentScan(basePackages = "io.edition.concepts.dnslookup")
public class DnsLookupConfiguration {}
