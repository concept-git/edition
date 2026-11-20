package io.space.concepts.dnslookup.adapters;

import io.space.concepts.dnslookup.api.*;

/** Construction entry; production imports belong to application bootstrap. */
@org.springframework.context.annotation.Configuration(proxyBeanMethods = false)
@org.springframework.context.annotation.ComponentScan(basePackages = "io.space.concepts.dnslookup")
public class DnsLookupConfiguration {}
