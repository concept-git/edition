/**
 * HTTP 失败出口：RFC 9457 载荷、problem-code → status/title/detail 的唯一映射表（ProblemCatalog）、
 * 通用异常翻译、filter 链写出与追踪标识。
 * 拥有稳定 problem 形态；不决定领域失败条件（那由 sync 的 FlowException 以 ProblemCode 声明）或重试策略。
 */
package io.edition.control.adapters.inbound.http.problem;
