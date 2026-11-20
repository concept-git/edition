/**
 * 页面创作与修订 flow：接收页面列表/查看/创建/预览/改名/编辑/修订历史/取回请求，
 * 把 Page、Revision、Space 三个概念在一个事务里接力。
 *
 * <p>拥有：页面 sync、[tenant, space, page] 链的访问投影与 Actor 翻译、响应投影、
 * 预览 renderer，以及页面自身的 error case。真实归属走组合根 {@code ResourceChain}；
 * authored 可写走 {@code AuthoringWrites}（归档/mode 异常在组合根）。复用组合根的
 * 租户准入、幂等执行。不拥有 Page/Revision 状态，不解析 HTTP 头（If-Match 在 gateway）。
 */
@org.springframework.modulith.NamedInterface("authoring")
package io.space.control.compositions.authoring.pageediting;
