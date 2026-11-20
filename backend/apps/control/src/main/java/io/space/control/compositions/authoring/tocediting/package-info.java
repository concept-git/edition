/**
 * 目录编排 flow：接收空间目录的读取与 add/move/relabel/remove 请求。
 *
 * <p>拥有：Toc sync、[tenant, space] 链的访问投影、条目归属与 TocView 投影，
 * 以及目录自身的 error case。真实归属走组合根 {@code ResourceChain}；authored 可写走
 * {@code AuthoringWrites}。不拥有 Toc 状态，不暴露 HTTP。{@code Toc.replace} 无本
 * flow 入口（随票 20 导入调用）。authored 且 autoRelease 开时 mutation 成功后同事务
 * {@code AuthoredAutoRelease.afterCompletion}，把工作区 Toc 推进 live 快照。
 */
@org.springframework.modulith.NamedInterface("authoring")
package io.space.control.compositions.authoring.tocediting;
