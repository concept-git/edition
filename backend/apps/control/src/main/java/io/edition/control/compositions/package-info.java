/**
 * 组合层（syncs 包）：唯一允许同时依赖多个概念模块的地方，组合根唯一。
 *
 * <p>flow 一律按入口拆成 {@code syncs/<组>/<flow>} 浅包，规格 SYNCS.md 与实现共存；
 * 跨组 flow 按入口 Requesting 动作的归属组落位。组织包无架构语义且不声明模块：
 * sync 引用任意组的概念照常合法。每条 sync 一个方法，方法名与 SYNCS.md 的 sync 名一致
 * （可机械 diff，由 SyncSpecParityTest 双向强制）。
 *
 * <p>跨 flow 共用件按子目标分在 {@code principal}（凭据→主体）、{@code access}
 * （租户准入与判权）、{@code flow}（幂等与 error case）、{@code resource}
 * （资源链与写锁）。这些子包不是 flow 组，也不是第五限界上下文。
 *
 * <p>本根包只放跨子目标组合件与跨组事件：{@code AuthoringWrites}、{@code DriftFacts}、
 * {@code RequestAuditContext}、
 * {@code ReaderPolicyEnsureRequested}。
 *
 * <p>薄编排：业务不变量一律下沉到所属概念的 domain；组合层积攒自有状态 = 该升格为概念。
 */
@org.springframework.modulith.ApplicationModule(
        id = "syncs",
        displayName = "Composition",
        allowedDependencies = {
            "shared",
            "platform.tenantregistry::api",
            "platform.idempotency::api",
            "platform.mailoutbox::api",
            "platform.objectstore::api",
            "platform.certificateinspection::api",
            "platform.analytics::api",
            "platform.webhook::api",
            "platform.audit::api",
            "platform.deletionrecovery::api",
            "platform.importformat::api",
            "platform.importjob::api",
            "platform.importformat::contract",
            "platform.importformat::archive",
            "platform.importformat::attachments",
            "platform.dnslookup::api",
            "platform.readersecurity::api",
            "platform.bundleexport::api",
            "platform.servicehealth::api",
            "platform.contenttype::api",
            "platform.plugindevelopment::api",
            "platform.pluginverification::api",
            "concepts.iam.user::api",
            "concepts.iam.password::api",
            "concepts.iam.session::api",
            "concepts.iam.apitoken::api",
            "concepts.iam.managementtoken::api",
            "concepts.iam.team::api",
            "concepts.iam.membership::api",
            "concepts.iam.permission::api",
            "concepts.authoring.space::api",
            "concepts.authoring.page::api",
            "concepts.authoring.revision::api",
            "concepts.authoring.toc::api",
            "concepts.authoring.collection::api",
            "concepts.authoring.tag::api",
            "concepts.releases.release::api",
            "concepts.hosting.site::api",
            "concepts.hosting.customdomain::api",
            "concepts.hosting.redirect::api",
            "concepts.hosting.search::api"
        })
package io.edition.control.compositions;
