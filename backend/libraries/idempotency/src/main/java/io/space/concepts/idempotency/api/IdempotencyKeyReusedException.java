package io.space.concepts.idempotency.api;

/** 同一 scope 的 key 已绑定到另一个 canonical request。 */
public final class IdempotencyKeyReusedException extends RuntimeException {}
