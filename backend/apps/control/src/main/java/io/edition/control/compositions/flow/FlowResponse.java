package io.edition.control.compositions.flow;

import java.util.Objects;

/**
 * 幂等 flow 的可重放响应：首次执行的结果值与其被持久化的序列化形态一起返回，
 * 重放时 gateway 原样写回同一 status / Content-Type / body（ADR-0016）。
 *
 * <p>所有幂等 mutation 统一用本类型，不再每个 flow 各定义一份字段顺序略有差异的 record。
 *
 * @param value          反序列化后的结果，供 sync 测试与非 HTTP 调用方直接断言
 * @param status         首次执行时确定的 HTTP 状态码（201 创建 / 200 变更 / 204 无载荷）
 * @param contentType    序列化 body 的媒体类型
 * @param serializedBody 与首次响应逐字节一致的 body；204 时为空串
 */
public record FlowResponse<T>(T value, int status, String contentType, String serializedBody) {

    public FlowResponse {
        Objects.requireNonNull(contentType, "contentType");
        Objects.requireNonNull(serializedBody, "serializedBody");
    }
}
