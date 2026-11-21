package io.edition.control.entry.http.security;

import io.edition.control.compositions.flow.FlowResponse;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;

/**
 * 幂等 mutation 的 HTTP 出口：首次与重放都原样写回 flow 存储的 status / Content-Type / 序列化 body，
 * 保证同键重放逐字节一致（ADR-0016）。与 {@link IdempotencyKeyFilter} 是同一协议的入口与出口。
 */
public final class IdempotentReplay {
    private IdempotentReplay() {}

    public static ResponseEntity<String> of(FlowResponse<?> response) {
        return builder(response).body(response.serializedBody());
    }

    /** 需要附加头（如页面 ETag）的调用方拿 builder 自行补头。 */
    public static ResponseEntity.BodyBuilder builder(FlowResponse<?> response) {
        return ResponseEntity.status(response.status()).contentType(MediaType.parseMediaType(response.contentType()));
    }
}
