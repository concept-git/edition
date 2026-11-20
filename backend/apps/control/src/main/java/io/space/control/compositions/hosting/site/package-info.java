/**
 * Site 管理 flow：拥有站点创建/列表/详情/补丁/挂载/排序/删除 sync、allowedActions 投影、
 * 补丁归一 {@code SitePatch}、概念有限输出翻译 {@code SiteResults}、本 flow error case（{@code SiteErrors}）。
 * 真实归属走组合根 {@code ResourceChain}。租户准入与幂等执行复用组合根。
 * 不拥有 Site 状态、不暴露 HTTP；域名、remount+Redirect、搜索重建不在本包。
 */
@org.springframework.modulith.NamedInterface("hosting")
package io.space.control.compositions.hosting.site;
