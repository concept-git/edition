/**
 * 服务状态 flow（入口 /admin/health 与 30s 心跳调度）。
 *
 * <p>purpose：让运营员一眼看到 management / reader / worker 三个进程是否活着、落后多少、积压多少。
 * 入口结果：每服务一个 normal / lagging / lost / unknown / unconfigured 判定与实例明细。
 * 非职责：不代表业务可用性（作业失败在作业页），不修改任何状态，不承载租户数据。
 */
@org.springframework.modulith.NamedInterface("platform")
package io.edition.control.usecases.platform.servicehealth;
