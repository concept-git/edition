package io.edition.contentapp.adapters.outbound;

import io.edition.contentapp.usecases.ports.ObjectBytes;
import io.edition.contentapp.usecases.shared.ContentProblem;
import io.minio.GetObjectArgs;
import io.minio.MinioClient;
import io.minio.StatObjectArgs;
import java.io.IOException;

public final class MinioObjectBytes implements ObjectBytes {
    private final MinioClient objects;

    public MinioObjectBytes(MinioClient objects) {
        this.objects = objects;
    }

    public byte[] read(String bucket, String key, int maxBytes) {
        try (var stream = objects.getObject(
                GetObjectArgs.builder().bucket(bucket).object(key).build())) {
            return stream.readNBytes(maxBytes);
        } catch (IOException | io.minio.errors.MinioException failure) {
            throw ContentProblem.unavailable();
        }
    }

    public long size(String bucket, String key) {
        try {
            return objects.statObject(
                            StatObjectArgs.builder().bucket(bucket).object(key).build())
                    .size();
        } catch (io.minio.errors.MinioException failure) {
            throw ContentProblem.unavailable();
        }
    }
}
