/**
 * 概念动作的审计切面：把 {@code @Audited} 方法翻译成 Audit 事实。
 * 本包不是 flow；审计查询与导出在 {@code platform.deletionrecovery}。
 */
package io.space.control.compositions.auditing;
