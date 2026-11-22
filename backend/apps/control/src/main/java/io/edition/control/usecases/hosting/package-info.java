/**
 * 托管 flow 的组织根：站点、域名、阅读入口与检索。
 *
 * <p>具体 flow 按入口浅包归放。读者侧只消费已 promote 的不可变发版。
 * 阅读 HTTP 由独立 edition-content 提供；本包只编排管理侧托管事实与交付意图。
 */
@org.springframework.modulith.NamedInterface("hosting")
package io.edition.control.usecases.hosting;
