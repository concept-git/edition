package io.space.concepts.objectstore.adapters;

import io.space.concepts.objectstore.api.*;

/** Construction entry; production imports belong to application bootstrap. */
@org.springframework.context.annotation.Configuration(proxyBeanMethods = false)
@org.springframework.context.annotation.ComponentScan(basePackages = "io.space.concepts.objectstore")
public class ObjectStoreConfiguration {}
