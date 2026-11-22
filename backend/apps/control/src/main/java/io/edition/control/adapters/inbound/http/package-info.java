/**
 * 接口层（Requesting）：五类 HTTP 入口适配，按稳定 HTTP 职责做一层浅分包，
 * controller 只做 DTO ↔ 动作翻译。本根包是唯一模块声明点，不承载具体端点。
 * 对外 API 只暴露应用动作（sync），永不直通概念动作；DTO 与 OpenAPI 契约都在本模块。
 *
 * <p><b>依赖收紧（护栏 E）</b>：本模块**只**可见 sync 与 shared——概念模块一个不列。
 * 于是"端点直通概念动作"在 Modulith 模型层即不可编译，无需靠评审发现。代价是 guard 之类
 * 组合层接口的入参若用到概念值类型（如 Permission 的 Resource/Operation），须先把该被动
 * 值类型下沉到 shared（Ids/错误码/游标一类），再由首个需要它的管理面票落地。
 */
@org.springframework.modulith.ApplicationModule(
        id = "gateway",
        displayName = "HTTP (Requesting)",
        allowedDependencies = {
            "shared",
            "syncs",
            "syncs::syncs",
            "syncs::iam",
            "syncs::platform",
            "syncs::authoring",
            "syncs::releases",
            "syncs::hosting"
        })
package io.edition.control.adapters.inbound.http;
