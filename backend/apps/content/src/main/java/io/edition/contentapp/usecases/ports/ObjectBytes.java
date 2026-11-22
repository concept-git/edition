package io.edition.contentapp.usecases.ports;

/** Object reads owned by the content use cases. The outbound adapter implements this. */
public interface ObjectBytes {
    byte[] read(String bucket, String key, int maxBytes);

    long size(String bucket, String key);
}
