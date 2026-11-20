package io.space.concepts.objectstore.adapters.minio;

import static org.assertj.core.api.Assertions.assertThat;

import io.space.concepts.objectstore.api.*;
import io.space.concepts.objectstore.api.ObjectStoreApi.PresignedPut;
import io.space.testing.MinioFixture;
import java.io.ByteArrayInputStream;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.util.UUID;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.testcontainers.containers.MinIOContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

/** 约定层对象存储：流式 put / open / 预签名 PUT，对着 Testcontainers MinIO 验行为。 */
@Testcontainers
class MinioObjectStoreTest {
    @Container
    static final MinIOContainer minio = MinioFixture.container();

    static MinioObjectStore store;

    @BeforeAll
    static void connect() {
        MinioFixture.ensureBucket(minio);
        store = new MinioObjectStore(
                new ObjectStoreProperties(
                        minio.getS3URL(),
                        minio.getUserName(),
                        minio.getPassword(),
                        MinioFixture.BUCKET,
                        minio.getS3URL()),
                Clock.systemUTC());
    }

    @Test
    void putIfAbsentStreamThenExistsAndOpenReadsBackTheSameBytes() throws Exception {
        byte[] payload = "import-zip-payload-v1".getBytes(StandardCharsets.UTF_8);
        String key = "stream-" + UUID.randomUUID();

        store.putIfAbsent(key, new ByteArrayInputStream(payload), payload.length, "application/zip");

        assertThat(store.exists(key)).isTrue();
        try (InputStream in = store.open(key).orElseThrow()) {
            assertThat(in.readAllBytes()).isEqualTo(payload);
        }

        store.putIfAbsent(
                key, new ByteArrayInputStream("other".getBytes(StandardCharsets.UTF_8)), 5, "application/zip");
        try (InputStream in = store.open(key).orElseThrow()) {
            assertThat(in.readAllBytes()).isEqualTo(payload);
        }
    }

    @Test
    void putIfAbsentStreamAcceptsUnknownSize() throws Exception {
        byte[] payload = "unknown-size-body".getBytes(StandardCharsets.UTF_8);
        String key = "unknown-" + UUID.randomUUID();

        store.putIfAbsent(key, new ByteArrayInputStream(payload), -1, "application/octet-stream");

        try (InputStream in = store.open(key).orElseThrow()) {
            assertThat(in.readAllBytes()).isEqualTo(payload);
        }
    }

    @Test
    void putIfAbsentBytesIsIdempotent() throws Exception {
        byte[] first = "first-payload".getBytes(StandardCharsets.UTF_8);
        byte[] second = "second-payload-different".getBytes(StandardCharsets.UTF_8);
        String key = "bytes-" + UUID.randomUUID();

        store.putIfAbsent(key, first, "application/octet-stream");
        store.putIfAbsent(key, second, "application/octet-stream");

        assertThat(store.exists(key)).isTrue();
        try (InputStream in = store.open(key).orElseThrow()) {
            assertThat(in.readAllBytes()).isEqualTo(first);
        }
    }

    @Test
    void presignPutReturnsANonBlankUrlThatExpiresInTheFuture() {
        String key = "upload-" + UUID.randomUUID();
        Instant before = Instant.now();

        PresignedPut signed = store.presignPut(key, Duration.ofMinutes(15), "application/zip");

        assertThat(signed.url()).isNotBlank().contains(key).doesNotContain("response-content-disposition");
        assertThat(signed.expiresAt()).isAfter(before).isBefore(before.plus(Duration.ofMinutes(16)));
    }

    @Test
    void openReturnsEmptyWhenTheKeyIsMissing() {
        assertThat(store.open("missing-" + UUID.randomUUID())).isEmpty();
    }
}
