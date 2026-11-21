/**
 * HTTP 安全与请求协议基础设施：Security 过滤链、Bearer 提取、请求级过滤器，
 * 以及幂等协议的入口（Idempotency-Key 过滤器）与出口（重放响应写回）。
 * 拥有过滤顺序与认证边界适配；不拥有业务授权规则或错误载荷契约。
 */
package io.edition.control.entry.http.security;
