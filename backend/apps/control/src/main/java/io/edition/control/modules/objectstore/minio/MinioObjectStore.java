package io.edition.control.modules.objectstore.minio;

import io.edition.control.modules.objectstore.api.*;
import io.edition.control.modules.objectstore.api.ObjectStoreApi;
import io.minio.GetObjectArgs;
import io.minio.GetPresignedObjectUrlArgs;
import io.minio.Http;
import io.minio.MinioClient;
import io.minio.PutObjectArgs;
import io.minio.StatObjectArgs;
import io.minio.errors.ErrorResponseException;
import io.minio.errors.MinioException;
import java.io.InputStream;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.Clock;
import java.time.Duration;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.concurrent.TimeUnit;
import okhttp3.OkHttpClient;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.stereotype.Component;

/**
 * MinIO 适配：内容寻址 put / stat / 预签名。两个 client 共享凭据：一个走服务内网 endpoint 读写，
 * 一个只用浏览器可达的公开 endpoint 计算签名（签名绑定 host，不能事后替换）。
 */
@Component
@EnableConfigurationProperties(ObjectStoreProperties.class)
class MinioObjectStore implements ObjectStoreApi {
    private static final String NO_SUCH_KEY = "NoSuchKey";
    /** MinIO SDK：未知 objectSize 时 partSize 必须 ≥ 5 MiB。 */
    private static final long UNKNOWN_SIZE_PART = 5L * 1024 * 1024;

    private final MinioClient client;
    private final MinioClient presigner;
    private final String bucket;
    private final Clock clock;

    MinioObjectStore(ObjectStoreProperties properties, Clock clock) {
        var http = new OkHttpClient.Builder()
                .connectTimeout(Duration.ofSeconds(5))
                .readTimeout(Duration.ofMinutes(30))
                .writeTimeout(Duration.ofMinutes(30))
                .build();
        this.client = MinioClient.builder()
                .endpoint(properties.endpoint())
                .credentials(properties.accessKey(), properties.secretKey())
                .httpClient(http)
                .build();
        this.presigner = MinioClient.builder()
                .endpoint(properties.presignPublicEndpoint())
                .credentials(properties.accessKey(), properties.secretKey())
                .httpClient(http)
                .build();
        this.bucket = properties.bucket();
        this.clock = clock;
    }

    @Override
    public void putIfAbsent(String key, byte[] bytes, String contentType) {
        Objects.requireNonNull(key, "key");
        if (exists(key)) return;
        call(
                "put " + key,
                () -> client.putObject(PutObjectArgs.builder()
                        .bucket(bucket)
                        .object(key)
                        .data(bytes, bytes.length)
                        .contentType(contentType)
                        .build()));
    }

    @Override
    public void putIfAbsent(String key, InputStream stream, long size, String contentType) {
        Objects.requireNonNull(key, "key");
        Objects.requireNonNull(stream, "stream");
        if (exists(key)) return;
        Long objectSize = size < 0 ? -1L : size;
        Long partSize = size < 0 ? UNKNOWN_SIZE_PART : -1L;
        call(
                "put " + key,
                () -> client.putObject(
                        PutObjectArgs.builder().bucket(bucket).object(key).stream(stream, objectSize, partSize)
                                .contentType(contentType)
                                .build()));
    }

    @Override
    public boolean exists(String key) {
        try {
            client.statObject(
                    StatObjectArgs.builder().bucket(bucket).object(key).build());
            return true;
        } catch (ErrorResponseException response) {
            if (NO_SUCH_KEY.equals(response.errorResponse().code())) return false;
            throw new Unavailable("object store stat rejected for " + key, response);
        } catch (MinioException failure) {
            throw new Unavailable("object store stat failed for " + key, failure);
        } catch (IllegalStateException transport) {
            // MinIO 9.x 把连接拒绝/超时等 IOException 包成 IllegalStateException 抛出
            throw new Unavailable("object store unreachable for stat " + key, transport);
        }
    }

    @Override
    public Optional<InputStream> open(String key) {
        Objects.requireNonNull(key, "key");
        try {
            return Optional.of(client.getObject(
                    GetObjectArgs.builder().bucket(bucket).object(key).build()));
        } catch (ErrorResponseException response) {
            if (NO_SUCH_KEY.equals(response.errorResponse().code())) return Optional.empty();
            throw new Unavailable("object store get rejected for " + key, response);
        } catch (MinioException failure) {
            throw new Unavailable("object store get failed for " + key, failure);
        } catch (IllegalStateException transport) {
            throw new Unavailable("object store unreachable for get " + key, transport);
        }
    }

    @Override
    public PresignedGet presignGet(String key, Duration ttl, String filename, String contentType) {
        int seconds = (int) Math.max(1, Math.min(ttl.toSeconds(), TimeUnit.DAYS.toSeconds(7)));
        String url = call(
                "presign " + key,
                () -> presigner.getPresignedObjectUrl(GetPresignedObjectUrlArgs.builder()
                        .method(Http.Method.GET)
                        .bucket(bucket)
                        .object(key)
                        .expiry(seconds, TimeUnit.SECONDS)
                        .extraQueryParams(Map.of(
                                "response-content-type",
                                contentType,
                                "response-content-disposition",
                                contentDisposition(filename)))
                        .build()));
        return new PresignedGet(url, clock.instant().plusSeconds(seconds));
    }

    @Override
    public PresignedPut presignPut(String key, Duration ttl, String contentType) {
        int seconds = (int) Math.max(1, Math.min(ttl.toSeconds(), TimeUnit.DAYS.toSeconds(7)));
        String url = call(
                "presign put " + key,
                () -> presigner.getPresignedObjectUrl(GetPresignedObjectUrlArgs.builder()
                        .method(Http.Method.PUT)
                        .bucket(bucket)
                        .object(key)
                        .expiry(seconds, TimeUnit.SECONDS)
                        .extraHeaders(Map.of("Content-Type", contentType))
                        .build()));
        return new PresignedPut(url, clock.instant().plusSeconds(seconds));
    }

    private static <T> T call(String operation, MinioCall<T> action) {
        try {
            return action.run();
        } catch (MinioException failure) {
            throw new Unavailable("object store " + operation + " failed", failure);
        } catch (IllegalStateException transport) {
            // 同上：SDK 对传输层异常的包装形态
            throw new Unavailable("object store unreachable for " + operation, transport);
        }
    }

    @FunctionalInterface
    private interface MinioCall<T> {
        T run() throws MinioException;
    }

    /** RFC 6266：ASCII 回退 + UTF-8 filename*，避免非 ASCII 文件名破坏响应头。 */
    private static String contentDisposition(String filename) {
        String ascii = filename.replaceAll("[^\\x20-\\x7E]", "_").replace("\"", "'");
        String encoded = URLEncoder.encode(filename, StandardCharsets.UTF_8).replace("+", "%20");
        return "inline; filename=\"" + ascii + "\"; filename*=UTF-8''" + encoded;
    }

    @Override
    public void remove(String key) {
        call("remove", () -> {
            client.removeObject(io.minio.RemoveObjectArgs.builder()
                    .bucket(bucket)
                    .object(key)
                    .build());
            return true;
        });
    }

    @Override
    public java.util.List<StoredObject> inventory(String after, int limit) {
        if (limit < 1 || limit > 1000) throw new IllegalArgumentException("invalid inventory limit");
        return call("inventory", () -> {
            var result = new java.util.ArrayList<StoredObject>();
            var request = io.minio.ListObjectsArgs.builder()
                    .bucket(bucket)
                    .recursive(true)
                    .startAfter(after)
                    .maxKeys(limit)
                    .build();
            for (var row : client.listObjects(request)) {
                var item = row.get();
                result.add(
                        new StoredObject(item.objectName(), item.lastModified().toInstant(), item.size()));
                if (result.size() >= limit) break;
            }
            return java.util.List.copyOf(result);
        });
    }
}
