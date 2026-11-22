/**
 * 幂等执行与 error case 载体。本包不是 flow 组，也不是第五限界上下文；仍属 syncs 模块。
 *
 * <p>{@code IdempotentFlowExecutor} + {@code FlowResponse} 是写入口的共用外壳；
 * {@code FlowException} 及其跨 flow 子类（游标 / 操作 / 键复用）是 HTTP 失败的统一输入。
 * {@code NamedInterface("syncs")} 把组合根公开类型暴露给 gateway，与 flow 组名无关。
 */
@org.springframework.modulith.NamedInterface("syncs")
package io.edition.control.usecases.flow;
