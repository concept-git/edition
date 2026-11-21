/**
 * 凭据解析到主体。本包不是 flow 组，也不是第五限界上下文；仍属 syncs 模块。
 *
 * <p>{@code PrincipalResolver} 按会话 / API token / 刷新 cookie 选出主体；具体解析器与 JWK 集在本包。
 * {@code NamedInterface("syncs")} 把组合根公开类型暴露给 gateway，与 flow 组名无关。
 */
@org.springframework.modulith.NamedInterface("syncs")
package io.edition.control.compositions.principal;
