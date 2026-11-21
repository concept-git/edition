/**
 * 内容创作 flow 的组织根：只做索引，不承载 sync。
 *
 * <p>具体 flow 按入口一层浅包归放：space、pageediting、tocediting、tagging、
 * collection、permission、deletion、termination、attachmentbrowsing。
 * 跨概念调用只在这些 flow 包完成，概念模块之间仍保持零引用；本包不形成新的 Modulith 模块边界。
 */
@org.springframework.modulith.NamedInterface("authoring")
package io.edition.control.compositions.authoring;
