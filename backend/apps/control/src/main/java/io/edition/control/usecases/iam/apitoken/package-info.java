/**
 * API token 生命周期 flow：共享事务编排签发+grant、可见列表与吊销+clearPrincipal。
 *
 * <p>本包不拥有 token 状态或 HTTP 安全过滤器。真实 space→tenant 走组合根
 * {@code ResourceChain}（miss 映射 400 tenant_space_mismatch）；角色上限在
 * {@code TokenRoleCeiling}。
 */
@org.springframework.modulith.NamedInterface("iam")
package io.edition.control.usecases.iam.apitoken;
