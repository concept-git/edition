/**
 * 发版 flow：authored 自动发版、手动构建、共享流水线与发版查询。
 * 持续导入的 live flow 在 {@code bundleimport}；便携导出在 {@code bundleexport}。
 * 不暴露 HTTP。
 */
@org.springframework.modulith.NamedInterface("releases")
package io.edition.control.compositions.releases.release;
