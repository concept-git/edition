package io.edition.control.modules.objectstore.minio;

import io.edition.control.modules.objectstore.api.*;
import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * MinIO 连接配置。{@code presignPublicEndpoint} 供浏览器可达地址（容器内外 host 不同）签名；
 * 为空时与 {@code endpoint} 相同。
 */
@ConfigurationProperties(prefix = "io.edition.object-store")
public record ObjectStoreProperties(
        String endpoint, String accessKey, String secretKey, String bucket, String presignPublicEndpoint) {
    public ObjectStoreProperties {
        if (endpoint == null || endpoint.isBlank())
            throw new IllegalArgumentException("object-store.endpoint is required");
        if (bucket == null || bucket.isBlank()) throw new IllegalArgumentException("object-store.bucket is required");
        if (presignPublicEndpoint == null || presignPublicEndpoint.isBlank()) presignPublicEndpoint = endpoint;
    }
}
