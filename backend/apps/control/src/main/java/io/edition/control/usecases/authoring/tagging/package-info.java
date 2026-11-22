/**
 * 标签 flow：接收页面打标/摘除、租户改名（合并）与跨空间聚合列表。
 *
 * <p>拥有：Tag sync、[tenant, space, page] 链的访问投影、标签目录游标与响应投影，
 * 以及本 flow 的 error case。真实归属走组合根 {@code ResourceChain}；authored 可写走
 * {@code AuthoringWrites}。跨空间可见页由 {@code VisibleTaggedPages} 装配。
 * 复用 pageediting 的 {@code viewPage} 回 PageDetail。
 * 不拥有 Tag 状态，不暴露 HTTP。
 */
@org.springframework.modulith.NamedInterface("authoring")
package io.edition.control.usecases.authoring.tagging;
