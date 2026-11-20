/**
 * 资源链与写锁。本包不是 flow 组，也不是第五限界上下文；仍属 syncs 模块。
 *
 * <p>{@code ResourceChain} 解析 page/space/site→tenant；{@code ResourceWriteLocks} 串行化同空间写入。
 * 跨 flow 共用的不存在/归档/模式/包形态拒绝也在这里，避免每个 flow 各写一份。
 * {@code NamedInterface("syncs")} 把组合根公开类型暴露给 gateway，与 flow 组名无关。
 */
@org.springframework.modulith.NamedInterface("syncs")
package io.space.control.compositions.resource;
