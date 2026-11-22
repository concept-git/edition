/**
 * 空间分组 flow：接收租户分组树的读取与 create/patch/move/remove/place/unplace 请求。
 *
 * <p>拥有：Collection sync、租户根 admin 的访问投影、分组归属与 CollectionView 投影，
 * 以及分组自身的 error case。真实分组与空间归属走组合根 {@code ResourceChain}。
 * 不拥有 Collection 状态，不暴露 HTTP。
 */
@org.springframework.modulith.NamedInterface("authoring")
package io.edition.control.usecases.authoring.collection;
