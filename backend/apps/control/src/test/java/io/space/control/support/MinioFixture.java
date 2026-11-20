package io.space.control.support;

import io.minio.BucketExistsArgs;
import io.minio.MakeBucketArgs;
import io.minio.MinioClient;
import io.minio.StatObjectArgs;
import io.minio.errors.ErrorResponseException;
import io.minio.errors.MinioException;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.testcontainers.containers.MinIOContainer;
import org.testcontainers.utility.DockerImageName;

/** 测试侧 MinIO 真依赖：容器 → Spring 属性绑定 → 建桶；断言对象存在/缺失直接查对象存储。 */
public final class MinioFixture {
    public static final String BUCKET = "attachments-test";

    private MinioFixture() {}

    public static MinIOContainer container() {
        return new MinIOContainer(DockerImageName.parse(System.getenv()
                        .getOrDefault("SPACE_MINIO_TEST_IMAGE", "quay.io/minio/minio:RELEASE.2025-09-07T16-13-09Z"))
                .asCompatibleSubstituteFor("minio/minio"));
    }

    public static void bind(DynamicPropertyRegistry registry, MinIOContainer minio) {
        registry.add("io.space.object-store.endpoint", minio::getS3URL);
        registry.add("io.space.object-store.access-key", minio::getUserName);
        registry.add("io.space.object-store.secret-key", minio::getPassword);
        registry.add("io.space.object-store.bucket", () -> BUCKET);
    }

    public static MinioClient client(MinIOContainer minio) {
        return MinioClient.builder()
                .endpoint(minio.getS3URL())
                .credentials(minio.getUserName(), minio.getPassword())
                .build();
    }

    public static void ensureBucket(MinIOContainer minio) {
        try {
            MinioClient client = client(minio);
            if (!client.bucketExists(BucketExistsArgs.builder().bucket(BUCKET).build())) {
                client.makeBucket(MakeBucketArgs.builder().bucket(BUCKET).build());
            }
        } catch (MinioException failure) {
            throw new IllegalStateException("cannot prepare MinIO bucket", failure);
        }
    }

    public static boolean objectExists(MinIOContainer minio, String key) {
        try {
            client(minio)
                    .statObject(
                            StatObjectArgs.builder().bucket(BUCKET).object(key).build());
            return true;
        } catch (ErrorResponseException missing) {
            if ("NoSuchKey".equals(missing.errorResponse().code())) return false;
            throw new IllegalStateException(missing);
        } catch (MinioException failure) {
            throw new IllegalStateException(failure);
        }
    }
}
