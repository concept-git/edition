/**
 * 发版 flow 的组织根：只做索引，不承载 sync。
 *
 * <p>具体 flow 按入口一层浅包归放：{@code release}（发布与共享流水线）、
 * {@code bundleimport}（synced 空间持续导入）、{@code bundleexport}（便携导出）。
 * 本包不形成新的 Modulith 模块边界，也不是第五限界上下文。
 */
@org.springframework.modulith.NamedInterface("releases")
package io.space.control.compositions.releases;
