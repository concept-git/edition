package io.space.concepts.idempotency.api;

import java.time.Instant;
import java.util.Objects;
import java.util.UUID;
import java.util.function.Supplier;

/** ADR-0016 通用执行入口；调用方提供 canonical fingerprint 与最终响应语义。 */
public interface IdempotencyApi {

    StoredResponse execute(Command command, Supplier<StoredResponse> action);

    int deleteExpired(Instant cutoff, int limit);

    record Command(String principalType, UUID principalId, String operation, String key, String requestFingerprint) {
        public Command {
            principalType = required(principalType, "principal type");
            Objects.requireNonNull(principalId, "principal id");
            operation = required(operation, "operation");
            key = required(key, "idempotency key");
            requestFingerprint = required(requestFingerprint, "request fingerprint");
            if (key.length() > 255) {
                throw new IllegalArgumentException("idempotency key is too long");
            }
        }

        private static String required(String value, String name) {
            Objects.requireNonNull(value, name);
            if (value.isBlank()) {
                throw new IllegalArgumentException(name + " must not be blank");
            }
            return value;
        }
    }

    record StoredResponse(int status, String body, String contentType) {
        public StoredResponse {
            if (status < 100 || status > 599) {
                throw new IllegalArgumentException("invalid HTTP status");
            }
            Objects.requireNonNull(body, "response body");
            Objects.requireNonNull(contentType, "response content type");
            if (contentType.isBlank()) {
                throw new IllegalArgumentException("response content type must not be blank");
            }
        }
    }
}
