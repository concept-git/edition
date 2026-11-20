/**
 * 删除与恢复 flow：页面回收 / 还原 / 回收列表，authored 空间同事务摘目录。
 * 拥有：deletion sync、回收列表投影与 {@code edit} 闸门；真实归属走组合根
 * {@code ResourceChain}（已回收页仍 found）；authored 可写走 {@code AuthoringWrites}。
 * 不拥有 Page/Toc 状态，不暴露 HTTP。purge 与空间/站点终结无本票入口。
 * authored+autoRelease 下首次 trash / 还原仍为 published 的页会同事务 {@code AuthoredAutoRelease.afterCompletion}；
 * restore 不回挂目录。
 */
@org.springframework.modulith.NamedInterface("authoring")
package io.space.control.compositions.authoring.deletion;
