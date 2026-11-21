package io.edition.content;

/** Definition and its complete schema closure frozen for independent release delivery. */
public record ContentTypeSnapshot(String versionRef, String digest, ContentTypeDefinition definition) {}
