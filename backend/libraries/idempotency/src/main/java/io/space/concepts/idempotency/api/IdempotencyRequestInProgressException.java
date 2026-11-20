package io.space.concepts.idempotency.api;

/** 防御性语义：发现已提交但未完成的历史记录时，不可再次执行业务动作。 */
public final class IdempotencyRequestInProgressException extends RuntimeException {}
