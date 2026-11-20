/**
 * 搜索索引进程：从共享主库读取发布事实，只重建搜索索引，并上报心跳。
 *
 * <p>bootstrap 负责装配，composition 执行索引任务，entry 连接持久层及监控。
 * 不引用管理概念，不提供 HTTP 管理端点。
 */
package io.space.index;
