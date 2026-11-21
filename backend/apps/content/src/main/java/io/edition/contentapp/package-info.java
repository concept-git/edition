/**
 * 独立阅读进程：只从 serving 投影、交付桶和搜索 generation 读内容。
 *
 * <p>根包只放组合根。应用行为在 {@code compositions}，HTTP 与模板在 {@code entry.http}。不查询管理库，不调用管理概念。
 */
package io.edition.contentapp;
